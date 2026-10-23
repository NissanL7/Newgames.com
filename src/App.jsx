import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloudOff, Compass } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './components/Motion.jsx';
import { channels, defaultUser, notifications, videos as catalogVideos } from './data.js';
import { deleteVideoBlob, getVideoBlob, saveVideoBlob, useLocalStorage } from './lib/storage.js';
import { navigate, useRoute } from './lib/routing.js';
import { BottomNav, DesktopSidebar, Header } from './components/Navigation.jsx';
import AppSheets from './components/AppSheets.jsx';
import { EmptyState, Toast } from './components/UI.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import ShortsPage from './pages/ShortsPage.jsx';
import SubscriptionsPage from './pages/SubscriptionsPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import ChannelPage from './pages/ChannelPage.jsx';
import UploadPage from './pages/UploadPage.jsx';

const toggleInList = (list, id) => list.includes(id) ? list.filter((item) => item !== id) : [id, ...list];

export default function App() {
  const route = useRoute();
  const [storedUser, setUser] = useLocalStorage('mytube-user-v1', defaultUser);
  const [uploads, setUploads] = useLocalStorage('mytube-uploads-v1', []);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mediaVersion, setMediaVersion] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const mediaUrls = useRef(new Map());

  const user = useMemo(() => ({
    ...defaultUser,
    ...storedUser,
    settings: { ...defaultUser.settings, ...(storedUser.settings || {}) },
  }), [storedUser]);

  const channelsById = useMemo(() => Object.fromEntries(channels.map((channel) => [channel.id, channel])), []);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      for (const video of uploads) {
        if (mediaUrls.current.has(video.id)) continue;
        try {
          const blob = await getVideoBlob(video.id);
          if (blob && !cancelled) mediaUrls.current.set(video.id, URL.createObjectURL(blob));
        } catch {
          // Metadata remains visible with an explicit unavailable-media state.
        }
      }
      if (!cancelled) setMediaVersion((version) => version + 1);
    };
    if (uploads.length) hydrate();
    return () => { cancelled = true; };
  }, [uploads]);

  useEffect(() => () => {
    mediaUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const uploadVideos = useMemo(() => uploads.map((video) => ({
    ...video,
    local: true,
    src: mediaUrls.current.get(video.id) || '',
    channelId: 'you',
    likes: video.likes || 0,
    views: video.views || 0,
  })), [mediaVersion, uploads]); // eslint-disable-line react-hooks/exhaustive-deps
  const allVideos = useMemo(() => [...uploadVideos, ...catalogVideos], [uploadVideos]);
  const videosById = useMemo(() => Object.fromEntries(allVideos.map((video) => [video.id, video])), [allVideos]);

  const showToast = useCallback((message) => setToast(message), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else navigate('home');
  }, []);

  const actions = useMemo(() => ({
    toggleLike(id) {
      setUser((previous) => ({ ...previous, liked: toggleInList(previous.liked, id), disliked: previous.disliked.filter((item) => item !== id) }));
    },
    toggleDislike(id) {
      setUser((previous) => ({ ...previous, disliked: toggleInList(previous.disliked, id), liked: previous.liked.filter((item) => item !== id) }));
    },
    toggleSubscription(id) {
      setUser((previous) => ({ ...previous, subscribed: toggleInList(previous.subscribed, id) }));
    },
    setNotificationPref(id, value) {
      setUser((previous) => ({ ...previous, notificationPrefs: { ...previous.notificationPrefs, [id]: value } }));
    },
    toggleWatchLater(id) {
      setUser((previous) => ({ ...previous, watchLater: toggleInList(previous.watchLater, id) }));
    },
    notInterested(id) {
      setUser((previous) => ({ ...previous, notInterested: previous.notInterested.includes(id) ? previous.notInterested : [...previous.notInterested, id] }));
    },
    resetNotInterested() {
      setUser((previous) => ({ ...previous, notInterested: [] }));
    },
    recordHistory(id) {
      setUser((previous) => {
        const existing = previous.history.find((entry) => entry.id === id);
        const entry = { id, viewedAt: new Date().toISOString(), progress: existing?.progress || 0, duration: existing?.duration || 0 };
        return { ...previous, history: [entry, ...previous.history.filter((item) => item.id !== id)].slice(0, 60) };
      });
    },
    updateHistoryProgress(id, progress, duration) {
      if (!Number.isFinite(progress)) return;
      setUser((previous) => ({
        ...previous,
        history: previous.history.map((entry) => entry.id === id ? { ...entry, progress, duration: Number.isFinite(duration) ? duration : entry.duration } : entry),
      }));
    },
    clearHistory() {
      setUser((previous) => ({ ...previous, history: [] }));
    },
    addComment(videoId, text) {
      const comment = {
        id: `local-comment-${Date.now()}`,
        author: 'Alex Viewer',
        handle: '@alexviewer',
        color: '#7c3aed',
        text,
        likes: 0,
        createdAt: 'Just now',
        createdAtDate: new Date().toISOString(),
        local: true,
      };
      setUser((previous) => ({ ...previous, comments: { ...previous.comments, [videoId]: [comment, ...(previous.comments[videoId] || [])] } }));
    },
    deleteComment(videoId, commentId) {
      setUser((previous) => ({ ...previous, comments: { ...previous.comments, [videoId]: (previous.comments[videoId] || []).filter((comment) => comment.id !== commentId) } }));
    },
    toggleCommentLike(id) {
      setUser((previous) => ({ ...previous, likedComments: toggleInList(previous.likedComments, id), dislikedComments: previous.dislikedComments.filter((item) => item !== id) }));
    },
    toggleCommentDislike(id) {
      setUser((previous) => ({ ...previous, dislikedComments: toggleInList(previous.dislikedComments, id), likedComments: previous.likedComments.filter((item) => item !== id) }));
    },
    addRecentSearch(query) {
      setUser((previous) => ({ ...previous, recentSearches: [query, ...previous.recentSearches.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 8) }));
    },
    clearRecentSearches() {
      setUser((previous) => ({ ...previous, recentSearches: [] }));
    },
    createPlaylist(name, videoId) {
      const id = `playlist-${Date.now().toString(36)}`;
      setUser((previous) => ({ ...previous, playlists: [{ id, name, videoIds: videoId ? [videoId] : [], createdAt: new Date().toISOString() }, ...previous.playlists] }));
      return id;
    },
    togglePlaylistVideo(playlistId, videoId) {
      setUser((previous) => ({ ...previous, playlists: previous.playlists.map((playlist) => playlist.id === playlistId ? { ...playlist, videoIds: toggleInList(playlist.videoIds, videoId) } : playlist) }));
    },
    markNotificationRead(id) {
      setUser((previous) => ({ ...previous, readNotifications: previous.readNotifications.includes(id) ? previous.readNotifications : [...previous.readNotifications, id] }));
    },
    markAllNotificationsRead() {
      setUser((previous) => ({ ...previous, readNotifications: notifications.map((item) => item.id) }));
    },
    updateSettings(patch) {
      setUser((previous) => ({ ...previous, settings: { ...defaultUser.settings, ...(previous.settings || {}), ...patch } }));
    },
    async deleteUpload(id) {
      try { await deleteVideoBlob(id); } catch { /* Metadata can still be removed if media is already missing. */ }
      const url = mediaUrls.current.get(id);
      if (url) URL.revokeObjectURL(url);
      mediaUrls.current.delete(id);
      setUploads((previous) => previous.filter((video) => video.id !== id));
      setUser((previous) => ({
        ...previous,
        liked: previous.liked.filter((item) => item !== id),
        disliked: previous.disliked.filter((item) => item !== id),
        watchLater: previous.watchLater.filter((item) => item !== id),
        history: previous.history.filter((item) => item.id !== id),
        playlists: previous.playlists.map((playlist) => ({ ...playlist, videoIds: playlist.videoIds.filter((item) => item !== id) })),
      }));
      setMediaVersion((version) => version + 1);
    },
  }), [setUploads, setUser]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = user.settings.theme === 'dark' || (user.settings.theme === 'system' && media.matches);
      root.dataset.theme = dark ? 'dark' : 'light';
      root.dataset.reduceMotion = user.settings.reduceMotion ? 'true' : 'false';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#08090d' : '#f5f6fa');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [user.settings.reduceMotion, user.settings.theme]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  useEffect(() => {
    const capture = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', capture);
    return () => window.removeEventListener('beforeinstallprompt', capture);
  }, []);

  const handleShare = async (video, forceNative = false) => {
    const url = `${window.location.origin}${window.location.pathname}#/watch/${encodeURIComponent(video.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, text: `Watch “${video.title}” on MyTube`, url });
        closeSheet();
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    if (!forceNative) setSheet({ type: 'share', video });
  };

  const handleDownload = (video) => {
    if (!video.src) { showToast('The local media file is unavailable.'); return; }
    const link = document.createElement('a');
    link.href = video.src;
    link.download = video.fileName || `${video.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.mp4`;
    if (!video.local) { link.target = '_blank'; link.rel = 'noopener'; }
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(video.local ? 'Preparing your download' : 'Video source opened. Use your browser menu to save it.');
  };

  const handlePublish = async (file, metadata) => {
    const id = `local-${Date.now().toString(36)}`;
    await saveVideoBlob(id, file);
    const video = {
      id,
      ...metadata,
      channelId: 'you',
      views: 0,
      likes: 0,
      publishedAt: new Date().toISOString(),
      uploadedAt: 'Just now',
      tags: [metadata.category.toLowerCase(), 'my creation'],
      fileName: file.name,
      mimeType: file.type,
      local: true,
    };
    if (!video.thumbnail) video.thumbnail = '/assets/thumbnails/music-vlog.png';
    mediaUrls.current.set(id, URL.createObjectURL(file));
    setUploads((previous) => [video, ...previous]);
    setMediaVersion((version) => version + 1);
    closeSheet();
    showToast(`${metadata.isShort ? 'Short' : 'Video'} published on this device`);
    navigate(`watch/${id}`);
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') { showToast('MyTube installed'); setInstallPrompt(null); closeSheet(); }
  };

  const openOptions = (video) => setSheet({ type: 'options', video });
  const openSave = (video) => setSheet({ type: 'save', video });
  const unreadCount = notifications.filter((item) => !user.readNotifications.includes(item.id)).length;
  const fullScreenRoute = ['watch', 'search', 'shorts', 'upload'].includes(route.name);
  const hideBottomNav = ['watch', 'search', 'upload'].includes(route.name);
  const currentChannel = channelsById[route.id];

  let page;
  const shared = { videos: allVideos, channelsById, user, actions, navigate, onOptions: openOptions, onSave: openSave, showToast };
  switch (route.name) {
    case 'home': page = <HomePage {...shared} />; break;
    case 'search': page = <SearchPage {...shared} channels={channels} route={route} goBack={goBack} />; break;
    case 'watch': page = <WatchPage {...shared} video={videosById[route.id]} onSave={openSave} onShare={handleShare} onDownload={handleDownload} goBack={goBack} />; break;
    case 'shorts': page = <ShortsPage {...shared} route={route} goBack={goBack} onShare={handleShare} onComments={(video) => setSheet({ type: 'comments', video })} />; break;
    case 'subscriptions': page = <SubscriptionsPage {...shared} channels={channels} />; break;
    case 'library': page = <LibraryPage videosById={videosById} uploads={uploadVideos} user={user} channel={channelsById.you} navigate={navigate} openSettings={() => setSheet({ type: 'settings' })} openCreatePlaylist={() => setSheet({ type: 'create-playlist' })} />; break;
    case 'collection': page = <CollectionPage {...shared} type={route.id} uploads={uploadVideos} videosById={videosById} goBack={goBack} />; break;
    case 'playlist': page = <CollectionPage {...shared} type={`playlist:${route.id}`} uploads={uploadVideos} videosById={videosById} goBack={goBack} />; break;
    case 'channel': page = <ChannelPage {...shared} channel={currentChannel} videos={allVideos.filter((video) => video.channelId === route.id && (route.id === 'you' || video.visibility !== 'private'))} />; break;
    case 'upload': page = <UploadPage onPublish={handlePublish} goBack={goBack} />; break;
    default: page = <EmptyState icon={Compass} title="That page doesn’t exist" description="The link may be old or incomplete. Head back to your feed to keep watching." action="Back home" onAction={() => navigate('home')} />;
  }

  return (
    <div className={`app-shell ${!fullScreenRoute ? 'with-sidebar' : ''} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} route-${route.name}`}>
      {!fullScreenRoute && <Header route={route} navigate={navigate} unreadCount={unreadCount} onNotifications={() => setSheet({ type: 'notifications' })} onMenu={() => setSidebarCollapsed((value) => !value)} channel={channelsById.you} />}
      {!fullScreenRoute && <DesktopSidebar route={route} navigate={navigate} collapsed={sidebarCollapsed} onSettings={() => setSheet({ type: 'settings' })} />}
      {!online && <div className="offline-banner"><CloudOff size={16} /> You’re offline. Local videos and saved screens still work.</div>}
      <main className="app-main">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={route.path}>{page}</PageTransition>
        </AnimatePresence>
      </main>
      {!hideBottomNav && <BottomNav route={route} navigate={navigate} />}
      <AppSheets
        sheet={sheet ? { ...sheet, videosById } : null}
        setSheet={setSheet}
        close={closeSheet}
        user={user}
        actions={actions}
        channelsById={channelsById}
        navigate={navigate}
        showToast={showToast}
        onShare={handleShare}
        onDownload={handleDownload}
        installApp={installPrompt ? installApp : null}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
