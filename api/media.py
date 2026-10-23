import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

try:
    from ._media import (
        MediaError, canonical_youtube_url, extract_info, media_payload,
        same_origin_or_handled, send_json, send_media_error,
    )
except ImportError:
    from _media import (
        MediaError, canonical_youtube_url, extract_info, media_payload,
        same_origin_or_handled, send_json, send_media_error,
    )


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Allow', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()

    def do_GET(self):
        if not same_origin_or_handled(self):
            send_json(self, 403, {'error': 'Cross-origin requests are not allowed.'})
            return
        query = parse_qs(urlparse(self.path).query)
        self._handle(query.get('url', [None])[0])

    def do_POST(self):
        if not same_origin_or_handled(self):
            send_json(self, 403, {'error': 'Cross-origin requests are not allowed.'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length <= 0 or length > 8192:
                raise MediaError('The request body is empty or too large.')
            payload = json.loads(self.rfile.read(length).decode('utf-8'))
            self._handle(payload.get('url'))
        except json.JSONDecodeError:
            send_json(self, 400, {'error': 'The request must contain valid JSON.'})
        except Exception as error:
            send_media_error(self, error)

    def _handle(self, value):
        try:
            video_url = canonical_youtube_url(value)
            info = extract_info(video_url)
            send_json(self, 200, media_payload(info, video_url))
        except Exception as error:
            send_media_error(self, error)

    def log_message(self, format, *args):
        print(f'Media metadata: {format % args}')
