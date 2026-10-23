import { History, ListVideo, Play, Shuffle, Trash2 } from 'lucide-react';
import VideoCard from '../components/VideoCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { EmptyState } from '../components/UI.jsx';

export default function CollectionPage({ type = '', videosById, channelsById, uploads, user, actions, navigate, onOptions, goBack, showToast }) {
  const playlist = type.startsWith('playlist:') ? user.playlists.find((item) => item.id === type.split(':')[1]) : null;
  const config = {
    history: { title: 'Watch history', description: 'Pick up where you left off', ids: user.history.map((entry) => entry.id) },
    'watch-later': { title: 'Watch Later', description: 'Videos you saved for later', ids: user.watchLater },
    liked: { title: 'Liked videos', description: 'Videos you’ve given a thumbs up', ids: user.liked },
    uploads: { title: 'Your videos', description: 'Creations stored on this device', ids: uploads.map((video) => video.id) },
  }[type] || (playlist ? { title: playlist.name, description: 'Your personal playlist', ids: playlist.videoIds } : { title: 'Collection', description: '', ids: [] });
  const videos = config.ids.map((id) => videosById[id]).filter(Boolean);

  const shuffle = () => {
    if (!videos.length) return;
    const random = videos[Math.floor(Math.random() * videos.length)];
    navigate(`watch/${random.id}`);
  };

  return (
    <div className="page-content collection-page">
      <SectionHeader title={config.title} subtitle={`${videos.length} video${videos.length === 1 ? '' : 's'} · ${config.description}`} onBack={goBack}>
        {type === 'history' && videos.length > 0 && <button className="icon-text-button danger-text" onClick={() => { actions.clearHistory(); showToast('Watch history cleared'); }}><Trash2 size={18} /><span>Clear</span></button>}
      </SectionHeader>
      {videos.length > 0 && (
        <div className="collection-controls">
          <button className="button button-primary" onClick={() => navigate(`watch/${videos[0].id}`)}><Play size={17} fill="currentColor" /> Play all</button>
          <button className="button button-secondary" onClick={shuffle}><Shuffle size={17} /> Shuffle</button>
        </div>
      )}
      {videos.length ? (
        <div className="video-feed collection-feed">
          {videos.map((video) => {
            const history = type === 'history' ? user.history.find((entry) => entry.id === video.id) : null;
            const progress = history?.progress && history?.duration ? (history.progress / history.duration) * 100 : 0;
            return <VideoCard key={video.id} video={video} channel={channelsById[video.channelId]} navigate={navigate} onOptions={onOptions} progress={progress} />;
          })}
        </div>
      ) : (
        <EmptyState
          icon={type === 'history' ? History : ListVideo}
          title="This collection is empty"
          description={type === 'uploads' ? 'Upload a video from your device to see it here.' : 'Explore the feed and save something worth watching.'}
          action={type === 'uploads' ? 'Upload a video' : 'Explore videos'}
          onAction={() => navigate(type === 'uploads' ? 'upload' : 'home')}
        />
      )}
    </div>
  );
}
