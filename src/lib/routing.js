import { useEffect, useState } from 'react';

export function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '') || 'home';
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return {
    name: parts[0] || 'home',
    id: parts[1] ? decodeURIComponent(parts[1]) : null,
    params: new URLSearchParams(query),
    path: raw,
  };
}

export function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const update = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}

export function navigate(path) {
  const normalized = path.replace(/^#\/?/, '');
  if (parseRoute().path === normalized) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = `/${normalized}`;
}
