import json
import os
import re
import tempfile
from pathlib import Path
from urllib.parse import quote, urlparse

import yt_dlp

MAX_DURATION_SECONDS = 15 * 60
MAX_FILE_BYTES = 350 * 1024 * 1024
MAX_HEIGHT = 1080
ALLOWED_AUDIO_BITRATES = {'128', '192', '320'}
VIDEO_ID_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{11}$')
YOUTUBE_HOSTS = {
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
    'youtu.be', 'www.youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
}


class MediaError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


def canonical_youtube_url(value):
    if not isinstance(value, str) or len(value) > 2048:
        raise MediaError('A valid YouTube video link is required.')
    candidate = value.strip()
    if not candidate or any(character.isspace() for character in candidate):
        raise MediaError('Paste one complete YouTube video link.')
    if not re.match(r'^https?://', candidate, re.IGNORECASE):
        candidate = f'https://{candidate}'
    parsed = urlparse(candidate)
    host = parsed.hostname.lower() if parsed.hostname else ''
    if parsed.scheme not in {'http', 'https'} or host not in YOUTUBE_HOSTS:
        raise MediaError('Only YouTube video and Shorts links are supported by this endpoint.')

    parts = [part for part in parsed.path.split('/') if part]
    video_id = None
    if host.endswith('youtu.be') and parts:
        video_id = parts[0]
    elif parsed.path == '/watch':
        from urllib.parse import parse_qs
        video_id = parse_qs(parsed.query).get('v', [None])[0]
    elif parts and parts[0] in {'shorts', 'embed', 'live'} and len(parts) > 1:
        video_id = parts[1]

    if not video_id or not VIDEO_ID_PATTERN.fullmatch(video_id):
        raise MediaError('The link does not contain a valid YouTube video ID.')
    return f'https://www.youtube.com/watch?v={video_id}'


def same_origin_or_handled(handler):
    origin = handler.headers.get('Origin')
    if not origin:
        return True
    return urlparse(origin).netloc == handler.headers.get('Host', '')


def send_json(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Cache-Control', 'no-store')
    handler.send_header('X-Content-Type-Options', 'nosniff')
    handler.end_headers()
    if handler.command != 'HEAD':
        handler.wfile.write(body)


def send_media_error(handler, error):
    if isinstance(error, MediaError):
        send_json(handler, error.status, {'error': error.message})
        return
    print(f'Media pipeline error: {type(error).__name__}: {str(error)[:700]}')
    message = str(error).lower() if str(error) else ''
    if 'sign in' in message or 'not a bot' in message or 'captcha' in message:
        payload = (503, 'YouTube requested verification for this video. Try another public video or try again later.')
    elif 'video unavailable' in message or 'private video' in message:
        payload = (404, 'This video is unavailable or private.')
    elif 'copyright' in message or 'blocked' in message:
        payload = (422, 'The source blocked this video from being prepared.')
    elif 'unsupported url' in message:
        payload = (400, 'This video link is not supported.')
    else:
        payload = (502, 'The media service could not prepare this video right now. Please try again.')
    send_json(handler, payload[0], {'error': payload[1]})


def base_options():
    options = {
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'cachedir': False,
        'socket_timeout': 20,
        'retries': 2,
        'fragment_retries': 2,
        'concurrent_fragment_downloads': 2,
        'nocheckcertificate': False,
        'no_color': True,
    }
    deno_path = Path(__file__).resolve().parent / 'runtime' / 'deno'
    if deno_path.is_file():
        options['js_runtimes'] = {'deno': {'path': str(deno_path)}}
    return options


def validate_info(info):
    if not info or info.get('_type') not in {None, 'video'}:
        raise MediaError('Playlists are not supported. Paste a single video link.')
    if info.get('is_live') or info.get('live_status') == 'is_live':
        raise MediaError('Live streams are not supported. Try the completed video instead.', 422)
    duration = info.get('duration')
    if duration and float(duration) > MAX_DURATION_SECONDS:
        raise MediaError('This video is longer than the 15-minute service limit.', 413)
    if not info.get('formats'):
        raise MediaError('No downloadable formats were returned for this video.', 422)


def extract_info(video_url, options=None):
    settings = base_options()
    if options:
        settings.update(options)
    with yt_dlp.YoutubeDL(settings) as ydl:
        info = ydl.extract_info(video_url, download=False)
        validate_info(info)
        return info


def media_payload(info, video_url):
    formats = info.get('formats', [])
    heights = sorted({
        int(item['height']) for item in formats
        if item.get('height') and item.get('vcodec') != 'none' and item.get('url')
        and 144 <= int(item['height']) <= MAX_HEIGHT
    }, reverse=True)
    has_audio = any(item.get('acodec') != 'none' and item.get('url') for item in formats)
    results = []

    for height in heights:
        quality = f'{height}p'
        results.append({
            'id': f'mp4-{height}',
            'format': 'mp4',
            'quality': quality,
            'url': f'/api/download?url={quote(video_url, safe="")}&format=mp4&quality={quote(quality)}',
            'size': None,
        })
    if has_audio:
        for bitrate in ('320', '192', '128'):
            quality = f'{bitrate} kbps'
            results.append({
                'id': f'mp3-{bitrate}',
                'format': 'mp3',
                'quality': quality,
                'url': f'/api/download?url={quote(video_url, safe="")}&format=mp3&quality={quote(quality)}',
                'size': None,
            })
    if not results:
        raise MediaError('No supported video or audio formats are available for this link.', 422)

    return {
        'title': info.get('title') or 'YouTube video',
        'author': info.get('uploader') or info.get('channel') or 'YouTube creator',
        'thumbnail': info.get('thumbnail'),
        'duration': info.get('duration'),
        'formats': results,
    }


def prepare_download(video_url, output_format, quality):
    from imageio_ffmpeg import get_ffmpeg_exe

    ffmpeg_location = get_ffmpeg_exe()
    options = {}
    if output_format == 'mp4':
        match = re.fullmatch(r'(\d{3,4})p', quality or '')
        if not match or not 144 <= int(match.group(1)) <= MAX_HEIGHT:
            raise MediaError('Choose a supported MP4 resolution up to 1080p.')
        height = match.group(1)
        options.update({
            'format': (
                f'bestvideo[height<={height}][ext=mp4]+bestaudio[ext=m4a]/'
                f'best[height<={height}][ext=mp4]/'
                f'bestvideo[height<={height}]+bestaudio/best[height<={height}]'
            ),
            'merge_output_format': 'mp4',
        })
    elif output_format == 'mp3':
        match = re.fullmatch(r'(128|192|320) kbps', quality or '')
        if not match:
            raise MediaError('Choose 128, 192, or 320 kbps for MP3 audio.')
        options.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': match.group(1),
            }],
        })
    else:
        raise MediaError('Only MP4 and MP3 downloads are supported.')

    temp_dir = tempfile.mkdtemp(prefix='savr-media-')
    options.update({
        'outtmpl': os.path.join(temp_dir, 'media.%(ext)s'),
        'ffmpeg_location': ffmpeg_location,
        'overwrites': True,
        'restrictfilenames': True,
    })

    try:
        settings = base_options()
        settings.update(options)
        with yt_dlp.YoutubeDL(settings) as ydl:
            info = ydl.extract_info(video_url, download=False)
            validate_info(info)
            ydl.process_ie_result(info, download=True)

        desired_extension = f'.{output_format}'
        files = [path for path in Path(temp_dir).iterdir() if path.is_file() and path.suffix == desired_extension]
        if not files:
            raise MediaError('The requested file could not be created. Try another format or quality.', 502)
        output = max(files, key=lambda path: path.stat().st_size)
        size = output.stat().st_size
        if size <= 0:
            raise MediaError('The media service returned an empty file.', 502)
        if size > MAX_FILE_BYTES:
            raise MediaError('The prepared file exceeds the 350 MB service limit. Choose a lower quality.', 413)
        return {
            'path': str(output),
            'temp_dir': temp_dir,
            'title': info.get('title') or 'savr-media',
            'size': size,
            'extension': output_format,
        }
    except Exception:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
