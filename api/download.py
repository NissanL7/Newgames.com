import re
import shutil
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, quote, urlparse

try:
    from ._media import (
        canonical_youtube_url, prepare_download, same_origin_or_handled,
        send_json, send_media_error,
    )
except ImportError:
    from _media import (
        canonical_youtube_url, prepare_download, same_origin_or_handled,
        send_json, send_media_error,
    )


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not same_origin_or_handled(self):
            send_json(self, 403, {'error': 'Cross-origin requests are not allowed.'})
            return
        query = parse_qs(urlparse(self.path).query)
        video_value = query.get('url', [None])[0]
        output_format = query.get('format', ['mp4'])[0]
        quality = query.get('quality', [None])[0]
        prepared = None
        response_started = False
        try:
            video_url = canonical_youtube_url(video_value)
            prepared = prepare_download(video_url, output_format, quality)
            raw_title = re.sub(r'[^\w\s.-]', '', prepared['title'], flags=re.UNICODE)
            title = re.sub(r'\s+', ' ', raw_title).strip()[:100] or 'savr-media'
            ascii_title = title.encode('ascii', 'ignore').decode('ascii').replace('"', '') or 'savr-media'
            extension = prepared['extension']
            self.send_response(200)
            response_started = True
            self.send_header('Content-Type', 'video/mp4' if extension == 'mp4' else 'audio/mpeg')
            self.send_header('Content-Length', str(prepared['size']))
            self.send_header(
                'Content-Disposition',
                f'attachment; filename="{ascii_title}.{extension}"; filename*=UTF-8\'\'{quote(title, safe="")}.{extension}',
            )
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            with open(prepared['path'], 'rb') as media_file:
                while chunk := media_file.read(64 * 1024):
                    self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError):
            print('Media download: client disconnected before completion')
        except Exception as error:
            if response_started:
                print(f'Media download: response interrupted: {type(error).__name__}')
            else:
                send_media_error(self, error)
        finally:
            if prepared:
                shutil.rmtree(prepared['temp_dir'], ignore_errors=True)

    def do_POST(self):
        send_json(self, 405, {'error': 'Use the prepared GET download link.'})

    def log_message(self, format, *args):
        print(f'Media download: {format % args}')
