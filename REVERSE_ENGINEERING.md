# SSYouTube workflow reconstruction

Target: `https://ssyou.online/en1401Yd/`

Investigation date: 2026-10-24

## Scope

The user asked to reverse engineer the supplied website and selected replacing MyTube with an original SSYouTube-inspired downloader interface. This document separates observed behavior, secondary references, inferences, and unresolved behavior.

## Observed from the target

The page title is **YouTube Video Downloader - SSYouTube**. The publicly retrieved page exposes a URL-entry workflow labeled Download/Paste and describes this sequence:

1. Copy a YouTube video URL.
2. Paste it into the website's text field.
3. Choose MP4 or MP3 and a resolution such as 4K, 1080p, or 720p.
4. Continue to a download button.
5. Save the resulting file on the current device.

The page also describes Shorts support, MP4/MP3/3GP/WEBM/M4A formats, desktop and mobile browser use, a download-location question, and FAQs about mobile downloading and MP3 conversion. The site root redirected to the same supplied page during static retrieval.

Evidence type: ordinary static page retrieval, not REA runtime evidence.

## Secondary references

Public image search returned third-party articles depicting an SSYouTube-style navy hero, a centered link field with a coral download action, and a result dialog containing thumbnail/title/format details. These are not authoritative captures of the supplied host and were not treated as proof of its current implementation.

## Runtime investigation and limitations

REA was invoked through its CLI because no REA MCP tools were registered in this session. A loopback Chromium target was created for the exact supplied URL. `list_browser_targets` returned REA Evidence `ev_50a42ad41acbeb55a907836df751382ca14007e9dc677ab773bc1e3d9ca57b72` for browser/target discovery only; it did not establish site behavior.

The controlled scenario could not navigate to the target. Its retained partial observation reported `net::ERR_CONNECTION_CLOSED` for the document request. No successful page capture, click, form submission, format response, or download transaction was observed. The scenario also ended with cleanup/protocol errors. Repeating the unchanged request was intentionally avoided.

Therefore the following remain unknown:

- The target's current production frontend implementation and styling.
- Its download/API endpoints, request schema, response schema, and provider.
- Whether it performs server-side conversion, proxying, or redirects to another service.
- Actual available resolutions, file sizes, rate limits, and error behavior.
- Whether its advertising, privacy, security, and unlimited-download claims are accurate.

## Initial reconstruction decisions

- Use an original brand, layout, code, and visual system rather than copying private or unobserved implementation.
- Preserve the observable link → details → format/quality → download interaction model.
- Support direct MP4, WebM, MOV, M4V, MP3, M4A, WAV, and OGG links without a backend.
- Retrieve public YouTube metadata through YouTube's oEmbed endpoint when the browser permits it; show an explicit metadata fallback otherwise.
- Do not fabricate a YouTube download response. An optional `VITE_DOWNLOADER_API_URL` adapter is documented for an authorized media service; no service is configured by default.
- Include a locally generated WebM sample so the complete direct-media workflow can be tested offline.
- Clearly tell users to download only media they own or have permission to save.

## Follow-up media service

After the initial deployment, the user supplied a screenshot showing that public metadata worked while the download action remained unavailable. The preview-only boundary was therefore replaced with Savr's own Python media service using `yt-dlp` and FFmpeg. It exposes real per-video MP4/MP3 formats and prepares downloads on demand, with single-video, duration, resolution, and file-size limits. The deployed extractor includes matching EJS challenge scripts and a pinned Deno runtime; these are generated deployment assets, not committed binaries. This is a new implementation choice, not newly observed evidence about the reference site's backend.
