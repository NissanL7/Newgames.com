const CACHE_NAME = 'savr-shell-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icons/icon.svg',
  '/assets/sample-poster.svg',
  '/assets/creator-sample.webm',
];

const warmShell = async () => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);

  // Vite fingerprints JS, CSS, and fonts. Discover those built assets from the
  // generated HTML/CSS so the very first install is already offline-complete.
  const indexResponse = await fetch('/index.html');
  const html = await indexResponse.text();
  const assets = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)]
    .map((match) => match[1]);
  const cssAssets = assets.filter((path) => path.endsWith('.css'));
  for (const path of cssAssets) {
    const response = await fetch(path);
    const css = await response.text();
    assets.push(...[...css.matchAll(/url\(["']?(\/assets\/[^)"']+)["']?\)/g)].map((match) => match[1]));
  }
  await cache.addAll([...new Set(assets)]);
};

self.addEventListener('install', (event) => {
  event.waitUntil(warmShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
