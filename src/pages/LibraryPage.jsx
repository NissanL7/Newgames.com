import {
  ChevronRight,
  Clock3,
  FolderPlus,
  History,
  ListVideo,
  Settings,
  ThumbsUp,
  Upload,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import { Avatar, EmptyState, IconButton } from '../components/UI.jsx';
import { formatCount } from '../lib/utils.js';
import { AnimatedNumber } from '../components/Motion.jsx';

function LibraryLink({ icon: Icon, title, count, onClick, color, preview }) {
  return (
    <button className="library-link" onClick={onClick}>
      <span className="library-link-icon" style={{ '--link-color': color }}><Icon size={22} /></span>
      <span className="library-link-copy"><strong>{title}</strong><small>{count} video{count === 1 ? '' : 's'}</small></span>
      {preview ? <img className="library-link-preview" src={preview} alt="" /> : null}
      <ChevronRight size={19} />
    </button>
  );
}

export default function LibraryPage({ videosById, uploads, user, channel, navigate, openSettings, openCreatePlaylist }) {
  const historyVideos = user.history.map((entry) => videosById[entry.id]).filter(Boolean);
  const likedVideos = user.liked.map((id) => videosById[id]).filter(Boolean);
  const laterVideos = user.watchLater.map((id) => videosById[id]).filter(Boolean);
  const playlists = user.playlists;

  return (
    <div className="page-content library-page">
      <SectionHeader title="You" subtitle="Your activity, playlists, and creations">
        <IconButton label="Settings" onClick={openSettings}><Settings size={22} /></IconButton>
      </SectionHeader>
      <section className="profile-card">
        <Avatar channel={channel} size="xl" />
        <div className="profile-card-copy"><h2>{channel.name}</h2><p>{channel.handle} · {formatCount(uploads.length)} creation{uploads.length === 1 ? '' : 's'}</p><button onClick={() => navigate('channel/you')}>View your channel <ChevronRight size={15} /></button></div>
      </section>
      <div className="library-stats">
        <button onClick={() => navigate('collection/history')}><strong><AnimatedNumber value={historyVideos.length} /></strong><span>Watched</span></button>
        <button onClick={() => navigate('collection/liked')}><strong><AnimatedNumber value={likedVideos.length} /></strong><span>Liked</span></button>
        <button onClick={() => navigate('channel/you')}><strong><AnimatedNumber value={uploads.length} /></strong><span>Created</span></button>
        <button onClick={() => navigate('collection/watch-later')}><strong><AnimatedNumber value={laterVideos.length} /></strong><span>Saved</span></button>
      </div>

      <section className="library-section">
        <div className="section-heading"><h2>Your activity</h2></div>
        <div className="library-links">
          <LibraryLink icon={History} title="History" count={historyVideos.length} color="#7c3aed" preview={historyVideos[0]?.thumbnail} onClick={() => navigate('collection/history')} />
          <LibraryLink icon={Clock3} title="Watch Later" count={laterVideos.length} color="#2563eb" preview={laterVideos[0]?.thumbnail} onClick={() => navigate('collection/watch-later')} />
          <LibraryLink icon={ThumbsUp} title="Liked videos" count={likedVideos.length} color="#db2777" preview={likedVideos[0]?.thumbnail} onClick={() => navigate('collection/liked')} />
          <LibraryLink icon={Upload} title="Your videos" count={uploads.length} color="#059669" preview={uploads[0]?.thumbnail} onClick={() => navigate('collection/uploads')} />
        </div>
      </section>

      <section className="library-section playlists-section">
        <div className="section-heading"><h2>Playlists</h2><button onClick={openCreatePlaylist}><FolderPlus size={18} /> New playlist</button></div>
        {playlists.length ? (
          <div className="playlist-grid">
            {playlists.map((playlist) => {
              const first = videosById[playlist.videoIds[0]];
              return (
                <button className="playlist-card" key={playlist.id} onClick={() => navigate(`playlist/${playlist.id}`)}>
                  <span className="playlist-art">
                    {first ? <img src={first.thumbnail} alt="" /> : <span><ListVideo size={30} /></span>}
                    <i><ListVideo size={15} /> {playlist.videoIds.length}</i>
                  </span>
                  <strong>{playlist.name}</strong>
                  <small>{playlist.videoIds.length} video{playlist.videoIds.length === 1 ? '' : 's'} · On this device</small>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={ListVideo} title="Make your first playlist" description="Group videos for a trip, a project, or your next movie night." action="Create playlist" onAction={openCreatePlaylist} />
        )}
      </section>
      <p className="privacy-footnote">Your likes, history, comments, playlists, and uploads stay in this browser on this device.</p>
    </div>
  );
}
