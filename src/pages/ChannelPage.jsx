import { useState } from 'react';
import { Bell, BellOff, Check, Info, Play, Upload, UsersRound } from 'lucide-react';
import VideoCard from '../components/VideoCard.jsx';
import { Avatar, EmptyState, Verified } from '../components/UI.jsx';
import { cx, formatCount } from '../lib/utils.js';

export default function ChannelPage({ channel, videos, user, actions, navigate, onOptions }) {
  const [tab, setTab] = useState('home');
  if (!channel) return <EmptyState icon={UsersRound} title="Channel not found" description="This channel may no longer be available." action="Back home" onAction={() => navigate('home')} />;
  const subscribed = user.subscribed.includes(channel.id);
  const preference = user.notificationPrefs[channel.id] || 'all';
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);

  const subscribe = () => {
    actions.toggleSubscription(channel.id);
    if (channel.id === 'you') navigate('upload');
  };

  return (
    <div className="channel-page">
      <div className="channel-banner" style={{ '--channel-color': channel.color }}>
        {videos[0] && <img src={videos[0].thumbnail} alt="" />}
        <span />
      </div>
      <div className="page-content channel-content">
        <section className="channel-profile">
          <Avatar channel={channel} size="channel" />
          <div className="channel-profile-copy">
            <h1>{channel.name}<Verified show={channel.verified} /></h1>
            <p>{channel.handle} · {formatCount(channel.subscribers)} subscriber{channel.subscribers === 1 ? '' : 's'}</p>
            <span>{videos.length} video{videos.length === 1 ? '' : 's'} · {formatCount(totalViews)} total views</span>
            <p className="channel-description-preview">{channel.description}</p>
          </div>
          {channel.id === 'you' ? (
            <button className="button button-primary channel-subscribe" onClick={() => navigate('upload')}><Upload size={17} /> Upload</button>
          ) : (
            <div className="channel-subscribe-group">
              <button className={cx('button channel-subscribe', subscribed ? 'button-secondary' : 'button-primary')} onClick={subscribe}>{subscribed && <Check size={17} />}{subscribed ? 'Subscribed' : 'Subscribe'}</button>
              {subscribed && <button className="button button-icon-secondary" onClick={() => actions.setNotificationPref(channel.id, preference === 'none' ? 'all' : 'none')} aria-label="Toggle channel notifications">{preference === 'none' ? <BellOff size={18} /> : <Bell size={18} />}</button>}
            </div>
          )}
        </section>
        <div className="channel-tabs" role="tablist">
          {['home', 'videos', 'about'].map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
        </div>

        {tab === 'about' ? (
          <section className="channel-about"><h2>About {channel.name}</h2><p>{channel.description}</p><div><Info size={19} /><span>Independent demo channel information</span></div><div><Play size={19} /><span>{formatCount(totalViews)} views across {videos.length} videos</span></div><div><UsersRound size={19} /><span>{formatCount(channel.subscribers)} subscribers</span></div></section>
        ) : videos.length ? (
          <>
            {tab === 'home' && (
              <section className="channel-featured">
                <div className="section-heading"><h2>Featured video</h2></div>
                <VideoCard video={videos[0]} channel={channel} navigate={navigate} onOptions={onOptions} />
              </section>
            )}
            <section>
              <div className="section-heading"><h2>{tab === 'home' ? 'More videos' : 'All videos'}</h2><span>{tab === 'home' ? videos.length - 1 : videos.length} videos</span></div>
              <div className="video-feed channel-video-feed">
                {(tab === 'home' ? videos.slice(1) : videos).map((video) => <VideoCard key={video.id} video={video} channel={channel} navigate={navigate} onOptions={onOptions} />)}
              </div>
            </section>
          </>
        ) : (
          <EmptyState icon={Upload} title="No videos yet" description={channel.id === 'you' ? 'Share something from your device. Your video stays local to this browser.' : 'This channel hasn’t published a video yet.'} action={channel.id === 'you' ? 'Upload your first video' : undefined} onAction={() => navigate('upload')} />
        )}
      </div>
    </div>
  );
}
