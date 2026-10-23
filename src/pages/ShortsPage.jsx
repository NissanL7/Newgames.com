import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  MessageCircle,
  MoreVertical,
  Pause,
  Play,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Avatar, EmptyState, IconButton } from '../components/UI.jsx';
import { cx, formatCount } from '../lib/utils.js';

function ShortItem({ video, channel, active, muted, autoplay, user, actions, navigate, onShare, onComments, onOptions, onActive }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const liked = user.liked.includes(video.id);
  const disliked = user.disliked.includes(video.id);
  const subscribed = user.subscribed.includes(channel.id);
  const saved = user.watchLater.includes(video.id);

  useEffect(() => {
    const element = containerRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.65) onActive(video.id);
    }, { threshold: [0.65] });
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [onActive, video.id]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media) return;
    media.muted = muted;
    if (active && autoplay) {
      media.play().catch(() => setPlaying(false));
    } else {
      media.pause();
      if (!active) setPlaying(false);
    }
  }, [active, autoplay, muted]);

  const togglePlay = () => {
    const media = videoRef.current;
    if (!media) return;
    if (media.paused) media.play().catch(() => {});
    else media.pause();
  };

  return (
    <article className="short-item" ref={containerRef}>
      <div className="short-media-wrap">
        <video
          ref={videoRef}
          src={video.src || undefined}
          poster={video.thumbnail}
          loop
          muted={muted}
          playsInline
          preload={active ? 'auto' : 'metadata'}
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setProgress(event.currentTarget.duration ? (event.currentTarget.currentTime / event.currentTarget.duration) * 100 : 0)}
        />
        {!playing && <button className="short-center-play" onClick={togglePlay} aria-label="Play Short"><Play size={30} fill="currentColor" /></button>}
        <div className="short-top-gradient" />
        <div className="short-bottom-gradient" />
        <div className="short-actions">
          <button className={liked ? 'active' : ''} onClick={() => actions.toggleLike(video.id)}><span><ThumbsUp size={23} fill={liked ? 'currentColor' : 'none'} /></span><small>{formatCount(video.likes + (liked ? 1 : 0))}</small></button>
          <button className={disliked ? 'active' : ''} onClick={() => actions.toggleDislike(video.id)}><span><ThumbsDown size={23} fill={disliked ? 'currentColor' : 'none'} /></span><small>Dislike</small></button>
          <button onClick={() => onComments(video)}><span><MessageCircle size={23} /></span><small>Comments</small></button>
          <button onClick={() => onShare(video)}><span><Share2 size={23} /></span><small>Share</small></button>
          <button className={saved ? 'active' : ''} onClick={() => actions.toggleWatchLater(video.id)}><span><Bookmark size={23} fill={saved ? 'currentColor' : 'none'} /></span><small>{saved ? 'Saved' : 'Save'}</small></button>
          <button onClick={() => onOptions(video)}><span><MoreVertical size={23} /></span><small>More</small></button>
        </div>
        <div className="short-info">
          <div className="short-channel-row">
            <button onClick={() => navigate(`channel/${channel.id}`)}><Avatar channel={channel} size="sm" /><strong>{channel.handle}</strong></button>
            {channel.id !== 'you' && <button className={cx('short-subscribe', subscribed && 'subscribed')} onClick={() => actions.toggleSubscription(channel.id)}>{subscribed ? <Check size={14} /> : null}{subscribed ? 'Subscribed' : 'Subscribe'}</button>}
          </div>
          <p>{video.title}</p>
          <span className="short-sound-label"><Volume2 size={14} /> Original audio · {channel.name}</span>
        </div>
        <div className="short-progress"><span style={{ width: `${progress}%` }} /></div>
      </div>
    </article>
  );
}

export default function ShortsPage({ videos, channelsById, user, actions, navigate, route, goBack, onShare, onComments, onOptions }) {
  const shorts = videos.filter((video) => video.isShort && video.visibility !== 'private');
  const requested = route.params.get('start');
  const [activeId, setActiveId] = useState(shorts.some((video) => video.id === requested) ? requested : shorts[0]?.id);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (requested && shorts.some((video) => video.id === requested)) {
      setActiveId(requested);
      const element = document.getElementById(`short-${requested}`);
      element?.scrollIntoView();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shorts.length) return <EmptyState title="No Shorts yet" description="Upload a vertical video to create your first Short." action="Create a Short" onAction={() => navigate('upload')} />;

  return (
    <div className="shorts-page">
      <header className="shorts-header">
        <IconButton label="Back" onClick={goBack}><ArrowLeft size={23} /></IconButton>
        <strong>Shorts</strong>
        <div>
          <IconButton label={muted ? 'Turn sound on' : 'Mute'} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX size={22} /> : <Volume2 size={22} />}</IconButton>
          <IconButton label="Search" onClick={() => navigate('search')}><Search size={22} /></IconButton>
        </div>
      </header>
      <div className="shorts-feed">
        {shorts.map((video) => (
          <div id={`short-${video.id}`} key={video.id}>
            <ShortItem
              video={video}
              channel={channelsById[video.channelId]}
              active={activeId === video.id}
              muted={muted}
              autoplay={user.settings.autoplayShorts}
              user={user}
              actions={actions}
              navigate={navigate}
              onShare={onShare}
              onComments={onComments}
              onOptions={onOptions}
              onActive={setActiveId}
            />
          </div>
        ))}
      </div>
      <span className="shorts-gesture-hint"><Pause size={13} /> Tap to pause · Scroll for more</span>
    </div>
  );
}
