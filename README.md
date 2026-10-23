# Savr

An original, responsive media-downloader interface reconstructed from the publicly observable SSYouTube workflow. Savr replaces the previous MyTube application in this repository.

## Run

```sh
npm install
npm run dev
```

Production check:

```sh
npm run build
npm run preview
```

## What works

- YouTube, YouTube Shorts, youtu.be, and direct-media URL validation.
- Public YouTube title/channel/thumbnail retrieval through YouTube oEmbed when the network permits it, with an explicit fallback when it does not.
- Direct MP4, WebM, MOV, M4V, MP3, M4A, WAV, and OGG link handling.
- Same-origin file downloads and external source handoff.
- An original four-second WebM sample that works without a media backend.
- Format/quality selection, clipboard paste/copy, clear errors, responsive results, and download notifications.
- Interactive format explorer, animated FAQ accordion, mobile/desktop layouts, reduced-motion support, and an installable offline app shell.

## YouTube download boundary

No YouTube extraction, conversion, or third-party download service is configured. The interface never claims that a YouTube file downloaded when no file was supplied. YouTube results are labeled **Preview only** until an authorized media service is connected.

To connect one, set `VITE_DOWNLOADER_API_URL` at build time. Savr sends:

```json
POST <VITE_DOWNLOADER_API_URL>
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

The endpoint must return JSON in this shape:

```json
{
  "title": "Video title",
  "author": "Channel name",
  "thumbnail": "https://example.test/thumbnail.jpg",
  "formats": [
    {
      "id": "mp4-720",
      "format": "mp4",
      "quality": "720p",
      "url": "https://example.test/authorized-file.mp4",
      "size": 12345678
    }
  ]
}
```

Use only a service you are authorized to operate, and download only media you own or have permission to save. Respect copyright and source-platform terms.

## Investigation

See `REVERSE_ENGINEERING.md` for observed behavior, secondary references, runtime limitations, and reconstruction decisions. The target's private backend and current live download transactions were not available to this investigation.

## Stack

React 19, Vite 6, Motion, Lucide icons, and bundled Inter Variable. No runtime CSS framework or account system is required.
