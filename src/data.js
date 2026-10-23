export const steps = [
  {
    number: '01',
    title: 'Copy the link',
    text: 'Grab the share link for a video, Short, or a direct media file you have permission to save.',
  },
  {
    number: '02',
    title: 'Choose your file',
    text: 'Review the media details, then pick your preferred format and quality from the available options.',
  },
  {
    number: '03',
    title: 'Save to your device',
    text: 'Start the download and find the file in your browser’s usual download location. No installation needed.',
  },
];

export const formatOptions = {
  mp4: {
    label: 'MP4',
    title: 'Video, ready for every screen',
    text: 'A familiar format for watching offline, sharing with your own devices, or editing your own footage.',
    icon: 'video',
    options: [
      { name: '4K Ultra HD', detail: '2160p · when supplied', tag: 'BEST' },
      { name: 'Full HD', detail: '1080p · when supplied', tag: 'SHARP' },
      { name: 'HD', detail: '720p · when supplied', tag: 'BALANCED' },
      { name: 'Data saver', detail: '480p / 360p · when supplied', tag: 'LIGHT' },
    ],
  },
  mp3: {
    label: 'MP3',
    title: 'Keep the sound, skip the screen',
    text: 'The media service extracts the available audio track and converts it to MP3 at your selected bitrate.',
    icon: 'audio',
    options: [
      { name: 'Studio quality', detail: '320 kbps · when supplied', tag: 'BEST' },
      { name: 'High quality', detail: '256 kbps · when supplied', tag: 'RICH' },
      { name: 'Standard', detail: '128 kbps · when supplied', tag: 'LIGHT' },
      { name: 'Original audio', detail: 'M4A / WAV / OGG · direct links', tag: 'SOURCE' },
    ],
  },
};

export const faqs = [
  {
    question: 'How does the downloader work?',
    answer: 'Paste a supported link above and select Get video. For direct media links, Savr prepares the original file. For supported public YouTube videos, the media service returns real MP4 and MP3 options, prepares the requested file, and then saves it through your browser.',
  },
  {
    question: 'Can I download YouTube videos here right now?',
    answer: 'Savr supports public single videos up to 15 minutes and 1080p. Availability depends on YouTube accepting the service’s authorized request; verification, IP restrictions, or source-side blocks can still prevent a download. Savr shows a clear error instead of pretending a file succeeded. When the service is blocked, you can open the independent SSYouTube reference in a new tab; its own availability, advertising, and terms apply. Direct media URLs and the included local sample do not use the YouTube service.',
  },
  {
    question: 'Can I use it on my phone?',
    answer: 'Yes. The interface is designed for mobile and desktop browsers. Your file goes to the download location configured in your browser, and you do not need to install a separate app.',
  },
  {
    question: 'Where do I find my downloaded file?',
    answer: 'Most browsers save files to your device’s Downloads folder. You can also open your browser’s download history to see the latest file and its exact location.',
  },
  {
    question: 'Which formats are supported for direct links?',
    answer: 'Direct MP4, WebM, MOV, M4V, MP3, M4A, WAV, and OGG URLs are recognized. Savr keeps the original file unchanged; it does not claim to convert it to another codec in the browser.',
  },
  {
    question: 'Is it okay to save any video?',
    answer: 'Only download media you own, that is licensed for downloading, or that you otherwise have permission to save. Follow copyright law and the source platform’s terms. Savr is not affiliated with YouTube or SSYouTube.',
  },
];
