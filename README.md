# MyTube

A mobile-first, installable video application built with React, Vite, and Motion. MyTube recreates the core everyday workflows of a mobile video platform with an original cinematic interface and a local-first personal profile.

The interface uses a featured-video parallax hero, masked word reveals, staggered content entrances, shared-layout navigation indicators, animated statistics, layered ambient backgrounds, and responsive glass surfaces. Motion primarily uses compositor-friendly transforms and opacity, with static reduced-motion fallbacks.

## Features

- Cinematic featured premiere with parallax, word reveals, and Watch Later actions
- Home feed with animated topic filters, staggered video cards, and a Shorts shelf
- Vertical, scroll-snap Shorts player with autoplay, mute, likes, comments, sharing, and subscriptions
- Full video player with seeking, volume, playback speed, fullscreen, and picture-in-picture where supported
- Search with live results, filters, recent searches, trending topics, and browser voice search
- Channel pages, subscriptions, and per-channel notification preferences
- Likes, dislikes, comments, watch history, playback progress, Watch Later, and custom playlists
- Local video and Short uploads with generated thumbnails and IndexedDB media persistence
- Share/copy links and source downloads
- Light, dark, and system themes; data saver and reduced-motion settings
- Responsive mobile/desktop layouts and an installable PWA app shell

## Local-first behavior

Personal activity is stored in this browser. Uploaded media is stored in IndexedDB and never sent to a remote server. The demo catalog uses openly hosted Google sample videos, so catalog playback requires an internet connection. Local uploads can play without one.

MyTube is an independent demo and is not affiliated with YouTube. It does not provide YouTube account sign-in, cloud synchronization, remote recommendations, monetization, or publishing to YouTube. Those features require official Google/YouTube APIs, OAuth credentials, backend services, and their respective policies.

## Run locally

```bash
npm install
npm run dev
```

The Vite server binds to `0.0.0.0` and accepts preview hosts.

## Production build

```bash
npm run build
npm run preview
```

The production service worker caches same-origin application assets. Video streams and range requests are deliberately not cached.

## Project structure

```text
src/
├── App.jsx                 # Routes and shared application state
├── data.js                 # Demo catalog, channels, and default profile
├── components/             # Navigation, player, cards, comments, sheets
├── pages/                  # Home, watch, Shorts, search, channels, library, creator
└── lib/                    # Routing, storage, and formatting helpers
public/
├── assets/                 # Bundled artwork and app icons
├── manifest.webmanifest
└── sw.js
```
