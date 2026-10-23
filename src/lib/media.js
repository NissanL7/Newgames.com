const MEDIA_TYPES = {
  mp4: 'video', webm: 'video', mov: 'video', m4v: 'video',
  mp3: 'audio', m4a: 'audio', wav: 'audio', ogg: 'audio',
};

const YOUTUBE_HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
  'youtu.be', 'www.youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
]);

const normalizeUrl = (rawValue) => {
  const value = rawValue.trim();
  if (!value) throw new Error('Paste a video or audio link to get started.');
  if (/\s/.test(value)) throw new Error('The link should not contain spaces. Paste one complete URL.');
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('That does not look like a valid link. Check it and try again.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS media links are supported.');
  }
  return url;
};

const validVideoId = (value) => /^[a-zA-Z0-9_-]{11}$/.test(value || '') ? value : null;

const getYouTubeId = (url) => {
  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;
  if (host.endsWith('youtu.be')) return validVideoId(url.pathname.split('/').filter(Boolean)[0]);
  if (url.pathname === '/watch') return validVideoId(url.searchParams.get('v'));
  const parts = url.pathname.split('/').filter(Boolean);
  if (['shorts', 'embed', 'live'].includes(parts[0])) return validVideoId(parts[1]);
  return null;
};

const directMediaDetails = (url) => {
  const extension = url.pathname.split('.').pop()?.toLowerCase();
  if (!MEDIA_TYPES[extension]) return null;
  const isSample = url.pathname === '/assets/creator-sample.webm';
  const fileName = decodeURIComponent(url.pathname.split('/').pop() || `media.${extension}`);
  const title = isSample
    ? 'Creator sample — a tiny motion study'
    : fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    kind: 'direct',
    id: isSample ? 'local-creator-sample' : url.href,
    inputUrl: url.href,
    url: url.href,
    title,
    author: isSample ? 'Savr original sample' : url.hostname.replace(/^www\./, ''),
    source: isSample ? 'On-device sample' : 'Direct media',
    thumbnail: isSample ? '/assets/sample-poster.svg' : null,
    mediaType: MEDIA_TYPES[extension],
    extension,
    metadataUnavailable: false,
    formats: [{
      id: 'original',
      format: extension,
      quality: 'Original',
      url: url.href,
      size: null,
    }],
  };
};

export const parseMediaLink = (rawValue) => {
  const url = normalizeUrl(rawValue);
  const direct = directMediaDetails(url);
  if (direct) return direct;
  const videoId = getYouTubeId(url);
  if (videoId) {
    return {
      kind: 'youtube',
      id: videoId,
      inputUrl: url.href,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: 'YouTube video',
      author: 'Public channel details unavailable',
      source: 'YouTube',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      mediaType: 'video',
      extension: 'mp4',
      metadataUnavailable: true,
      formats: [],
    };
  }
  throw new Error('Use a YouTube, Shorts, or direct MP4, WebM, MOV, M4V, MP3, M4A, WAV, or OGG link.');
};

const fetchYouTubeMetadata = async (media) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const endpoint = new URL('https://www.youtube.com/oembed');
    endpoint.searchParams.set('url', media.url);
    endpoint.searchParams.set('format', 'json');
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) throw new Error('Public metadata was unavailable.');
    const data = await response.json();
    return {
      ...media,
      title: typeof data.title === 'string' ? data.title : media.title,
      author: typeof data.author_name === 'string' ? data.author_name : 'YouTube creator',
      thumbnail: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : media.thumbnail,
      metadataUnavailable: false,
    };
  } catch {
    return media;
  } finally {
    clearTimeout(timeout);
  }
};

const requestServiceMedia = async (media, endpoint) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: media.url }),
  });
  if (!response.ok) throw new Error(`The media service returned an error (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data.formats)) throw new Error('The media service returned an invalid format list.');
  const formats = data.formats.filter((item) => (
    item && typeof item.url === 'string' && typeof item.format === 'string' && typeof item.quality === 'string'
  )).map((item, index) => ({
    id: String(item.id || `${item.format}-${item.quality}-${index}`),
    format: item.format.toLowerCase(),
    quality: item.quality,
    url: item.url,
    size: Number.isFinite(item.size) ? item.size : null,
  }));
  if (!formats.length) throw new Error('The media service did not provide any downloadable formats.');
  return {
    ...media,
    title: typeof data.title === 'string' ? data.title : media.title,
    author: typeof data.author === 'string' ? data.author : media.author,
    thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : media.thumbnail,
    metadataUnavailable: false,
    serviceConnected: true,
    formats,
  };
};

export const prepareMedia = async (rawValue) => {
  const media = parseMediaLink(rawValue);
  if (media.kind === 'direct') return media;
  const serviceEndpoint = import.meta.env.VITE_DOWNLOADER_API_URL?.trim();
  if (serviceEndpoint) return requestServiceMedia(media, serviceEndpoint);
  return fetchYouTubeMetadata(media);
};

export const availableQualities = (media, format) => {
  const serviceQualities = media.formats
    .filter((item) => item.format === format)
    .map((item) => item.quality);
  if (serviceQualities.length) return [...new Set(serviceQualities)];
  if (media.kind === 'direct') return ['Original'];
  return format === 'mp3'
    ? ['320 kbps', '256 kbps', '128 kbps']
    : ['2160p', '1440p', '1080p', '720p', '480p', '360p'];
};

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${unit}`;
};

const safeFileName = (title, extension) => {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'savr-media';
  return `${base}.${extension.replace(/^\./, '')}`;
};

export const saveMedia = async (media, format) => {
  if (!format?.url) throw new Error('This format is not available for download.');
  const url = new URL(format.url, window.location.href);
  const fileName = safeFileName(media.title, format.format || media.extension || 'media');
  const anchor = document.createElement('a');
  anchor.href = url.href;
  anchor.download = fileName;
  anchor.rel = 'noopener';

  if (url.origin !== window.location.origin) {
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return 'The source opened in a new tab. Use your browser menu if it does not download automatically.';
  }

  const response = await fetch(url.href);
  if (!response.ok) throw new Error(`The file could not be downloaded (${response.status}).`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  anchor.href = objectUrl;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  return 'Your download has started.';
};
