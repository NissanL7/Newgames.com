export function formatCount(value = 0) {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const formatted = (value / 1000).toFixed(value < 10_000 ? 1 : 0).replace('.0', '');
    return `${formatted}K`;
  }
  if (value < 1_000_000_000) {
    const formatted = (value / 1_000_000).toFixed(value < 10_000_000 ? 1 : 0).replace('.0', '');
    return `${formatted}M`;
  }
  return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
}

export function formatDuration(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const rounded = Math.floor(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function relativeDate(isoDate) {
  const then = new Date(isoDate).getTime();
  if (!Number.isFinite(then)) return 'Recently';
  const seconds = Math.max(0, (Date.now() - then) / 1000);
  if (seconds < 60) return 'Just now';
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, size] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${label}${count === 1 ? '' : 's'} ago`;
  }
  return 'Recently';
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
