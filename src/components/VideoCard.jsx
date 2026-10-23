import { CheckCircle2, MoreVertical, Play, Radio } from 'lucide-react';
import { Avatar, Verified } from './UI.jsx';
import { cx, formatCount, formatDuration } from '../lib/utils.js';

export function Thumbnail({ video, className = '', children, onClick, label }) {
  const content = (
    <>
      <img src={video.thumbnail} alt="" loading="lazy" />
      <span className="thumbnail-shade" />
      {children}
      {Number.isFinite(video.duration) && video.duration > 0 && <span className="duration-badge">{formatDuration(video.duration)}</span>}
    </>
  );
  return onClick ? (
    <button className={cx('thumbnail', className)} onClick={onClick} aria-label={label || `Play ${video.title}`}>
      {content}
    </button>
  ) : <div className={cx('thumbnail', className)}>{content}</div>;
}

export default function VideoCard({ video, channel, navigate, onOptions, compact = false, horizontal = false, progress }) {
  return (
    <article className={cx('video-card', compact && 'compact', horizontal && 'horizontal')}>
      <Thumbnail video={video} onClick={() => navigate(`watch/${video.id}`)}>
        {progress > 0 && <span className="watch-progress" style={{ width: `${Math.min(100, progress)}%` }} />}
      </Thumbnail>
      <div className="video-card-body">
        {!compact && (
          <button className="channel-avatar-button" onClick={() => navigate(`channel/${channel.id}`)} aria-label={`Visit ${channel.name}`}>
            <Avatar channel={channel} size="sm" />
          </button>
        )}
        <div className="video-card-copy">
          <button className="video-title-button" onClick={() => navigate(`watch/${video.id}`)}>
            <h3>{video.title}</h3>
          </button>
          <button className="video-channel-name" onClick={() => navigate(`channel/${channel.id}`)}>
            {channel.name}<Verified show={channel.verified && !compact} />
          </button>
          <p>{formatCount(video.views)} views <span>•</span> {video.uploadedAt}</p>
          {video.local && <span className="local-badge"><CheckCircle2 size={12} /> On this device</span>}
        </div>
        <button className="card-options" onClick={(event) => onOptions(video, event.currentTarget)} aria-label={`More actions for ${video.title}`}>
          <MoreVertical size={20} />
        </button>
      </div>
    </article>
  );
}

export function ShortsShelf({ videos, channelsById, navigate }) {
  return (
    <section className="shorts-shelf" aria-labelledby="shorts-shelf-title">
      <div className="section-heading">
        <h2 id="shorts-shelf-title"><span className="shorts-logo"><Play size={16} fill="currentColor" /></span> Shorts</h2>
        <button onClick={() => navigate('shorts')}>View all</button>
      </div>
      <div className="shorts-scroller">
        {videos.filter((video) => video.isShort).slice(0, 6).map((video) => (
          <button className="short-preview" key={video.id} onClick={() => navigate(`shorts?start=${video.id}`)}>
            <span className="short-preview-image">
              <img src={video.thumbnail} alt="" loading="lazy" />
              <span className="short-play"><Play size={18} fill="currentColor" /></span>
            </span>
            <strong>{video.title}</strong>
            <small>{formatCount(video.views)} views</small>
          </button>
        ))}
      </div>
    </section>
  );
}

export function LiveBadge() {
  return <span className="live-badge"><Radio size={12} /> LIVE</span>;
}
