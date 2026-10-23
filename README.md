# Savr

An original, responsive media-downloader interface reconstructed from the publicly observable SSYouTube workflow. Savr replaces the previous MyTube application in this repository.

## Run the frontend

```sh
npm install
npm run dev
```

Production check:

```sh
npm run build
npm run preview
```

Vercel also installs `requirements.txt` and runs the Python media functions. For local backend development, use the Vercel CLI with Python 3.12 available.

## What works

- YouTube, YouTube Shorts, youtu.be, and direct-media URL validation.
- Server-side YouTube metadata and real per-video format discovery through `yt-dlp`.
- MP4 downloads up to 1080p and MP3 audio conversion at 128, 192, or 320 kbps.
- Server-side preparation and browser download progress with clear service errors.
- Direct MP4, WebM, MOV, M4V, MP3, M4A, WAV, and OGG link handling.
- An original four-second WebM sample that works without the media backend.
- Clipboard paste/copy, responsive results, interactive format explorer, animated FAQs, reduced-motion support, and an installable offline app shell.

## Media service

The default metadata endpoint is `POST /api/media`:

```json
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

It returns the public title, channel, thumbnail, duration, and only the formats available for that video:

```json
{
  "title": "Video title",
  "author": "Channel name",
  "thumbnail": "https://example.test/thumbnail.jpg",
  "duration": 210,
  "formats": [
    {
      "id": "mp4-720",
      "format": "mp4",
      "quality": "720p",
      "url": "/api/download?url=...&format=mp4&quality=720p",
      "size": null
    }
  ]
}
```

`GET /api/download` validates the request again, prepares the selected file with `yt-dlp` and FFmpeg, and streams it as an attachment. MP4 requests prioritize compatible H.264 video and M4A audio; MP3 requests convert the best available audio track.

Service boundaries:

- Single public YouTube videos and Shorts only; no playlists or live streams.
- Maximum source duration: 15 minutes.
- Maximum MP4 resolution: 1080p.
- Maximum prepared file size: 350 MB.
- No account credentials, cookies, or private-video access.
- YouTube verification, geographic restrictions, and source-side blocking can still prevent a download; these produce explicit errors.

An external compatible metadata service can optionally be used instead by setting `VITE_DOWNLOADER_API_URL` at build time.

Use the service only for media you own, that is licensed for downloading, or that you otherwise have permission to save. Respect copyright and source-platform terms.

## Investigation

See `REVERSE_ENGINEERING.md` for the original target observations and limitations. The implemented backend is Savr's own service; it does not copy or route through the reference site's unknown backend.

## Stack

- Frontend: React 19, Vite 6, Motion, Lucide icons, bundled Inter Variable.
- Media functions: Python 3.12, `yt-dlp`, and FFmpeg supplied by `imageio-ffmpeg`.
- Deployment: static Vite assets plus Python Vercel Functions.
