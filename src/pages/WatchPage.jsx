import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  MoreVertical,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer.jsx';
import VideoCard from '../components/VideoCard.jsx';
import Comments from '../components/Comments.jsx';
import { Avatar, EmptyState, IconButton, Verified } from '../components/UI.jsx';
import { cx, formatCount } from '../lib/utils.js';

export default function WatchPage({ video, videos, channelsById, user, actions, navigate, onOptions, onSave, onShare, onDownload, goBack }) {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const lastProgress = useRef(0);
  const channel = video ? channelsById[video.channelId] : null;
  const related = video ? videos.filter((item) => item.id !== video.id && item.visibility !== 'private') : [];
  const nextVideos = video ? [
    ...related.filter((item) => item.category === video.category),
    ...related.filter((item) => item.category !== video.category),
  ] : [];

  useEffect(() => {
    if (video) actions.recordHistory(video.id);
    lastProgress.current = 0;
  }, [video?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!video) {
    return <EmptyState title="Video unavailable" description="This video may have been removed from this device." action="Back home" onAction={() => navigate('home')} />;
  }

  const liked = user.liked.includes(video.id);
  const disliked = user.disliked.includes(video.id);
  const subscribed = user.subscribed.includes(channel.id);
  const saved = user.watchLater.includes(video.id);

  return (
    <div className="watch-page">
      <div className="watch-topbar">
        <IconButton label="Back" onClick={goBack}><ArrowLeft size={23} /></IconButton>
        <span>Now playing</span>
        <div>
          <IconButton label="Search" onClick={() => navigate('search')}><Search size={21} /></IconButton>
          <IconButton label="Video options" onClick={() => onOptions(video)}><MoreVertical size={22} /></IconButton>
        </div>
      </div>
      <div className="watch-layout">
        <main className="watch-main">
          <VideoPlayer
            video={video}
            dataSaver={user.settings.dataSaver}
            onProgress={(current, duration) => {
              if (current - lastProgress.current >= 5 || current < lastProgress.current) {
                lastProgress.current = current;
                actions.updateHistoryProgress(video.id, current, duration);
              }
            }}
          />
          <div className="watch-info">
            <h1>{video.title}</h1>
            <p className="watch-metadata">{formatCount(video.views)} views · {video.uploadedAt} <span>#{video.category.toLowerCase().replace(/[^a-z0-9]/g, '')}</span></p>
            <div className="watch-channel-row">
              <button className="watch-channel" onClick={() => navigate(`channel/${channel.id}`)}>
                <Avatar channel={channel} size="md" />
                <span><strong>{channel.name}<Verified show={channel.verified} /></strong><small>{formatCount(channel.subscribers)} subscribers</small></span>
              </button>
              {channel.id === 'you' ? <span className="local-badge"><Check size={13} /> Your video</span> : (
                <button className={cx('button subscribe-button', subscribed ? 'button-secondary' : 'button-primary')} onClick={() => actions.toggleSubscription(channel.id)}>
                  {subscribed && <Check size={16} />}{subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
            <div className="watch-actions" aria-label="Video actions">
              <div className="like-group">
                <button className={liked ? 'active' : ''} onClick={() => actions.toggleLike(video.id)} aria-label="Like video"><ThumbsUp size={19} fill={liked ? 'currentColor' : 'none'} /><span>{formatCount(video.likes + (liked ? 1 : 0))}</span></button>
                <button className={disliked ? 'active' : ''} onClick={() => actions.toggleDislike(video.id)} aria-label="Dislike video"><ThumbsDown size={19} fill={disliked ? 'currentColor' : 'none'} /></button>
              </div>
              <button onClick={() => onShare(video)}><Share2 size={19} /><span>Share</span></button>
              <button onClick={() => onDownload(video)}><Download size={19} /><span>Download</span></button>
              <button className={saved ? 'active' : ''} onClick={() => onSave(video)}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /><span>Save</span></button>
            </div>
            <button className={cx('description-card', descriptionOpen && 'open')} onClick={() => setDescriptionOpen((open) => !open)}>
              <div className="description-heading"><strong>Description</strong>{descriptionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
              <p>{video.description}</p>
              <div className="description-tags">{(video.tags || []).map((tag) => <span key={tag}>#{tag.replace(/\s+/g, '')}</span>)}</div>
              {descriptionOpen && <small>Source: {video.local ? 'Uploaded from this device' : 'Open sample video collection'}<br />Playback and personal activity are provided by this independent demo.</small>}
            </button>
          </div>
          <div className="watch-comments">
            <Comments video={video} user={user} actions={actions} />
          </div>
        </main>
        <aside className="up-next">
          <div className="section-heading"><h2>Up next</h2><span>{nextVideos.length} videos</span></div>
          <div className="up-next-list">
            {nextVideos.map((item) => <VideoCard key={item.id} video={item} channel={channelsById[item.channelId]} navigate={navigate} onOptions={onOptions} compact horizontal />)}
          </div>
        </aside>
      </div>
    </div>
  );
}
