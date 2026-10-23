import { useMemo, useState } from 'react';
import { Bell, BellOff, BellRing, UsersRound } from 'lucide-react';
import VideoCard from '../components/VideoCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { Avatar, EmptyState, Verified } from '../components/UI.jsx';
import { cx } from '../lib/utils.js';

export default function SubscriptionsPage({ videos, channels, channelsById, user, actions, navigate, onOptions, showToast }) {
  const [selected, setSelected] = useState('all');
  const subscribedChannels = channels.filter((channel) => user.subscribed.includes(channel.id));
  const feed = useMemo(() => videos.filter((video) => (
    user.subscribed.includes(video.channelId)
    && video.visibility !== 'private'
    && (selected === 'all' || video.channelId === selected)
  )), [selected, user.subscribed, videos]);

  const cycleNotifications = (channelId) => {
    const current = user.notificationPrefs[channelId] || 'all';
    const next = current === 'all' ? 'personalized' : current === 'personalized' ? 'none' : 'all';
    actions.setNotificationPref(channelId, next);
    showToast(next === 'none' ? 'Notifications turned off' : next === 'all' ? 'All notifications on' : 'Personalized notifications on');
  };

  return (
    <div className="page-content subscriptions-page">
      <SectionHeader title="Subscriptions" subtitle="New videos from channels you follow" />
      {subscribedChannels.length ? (
        <>
          <div className="subscription-channels">
            <button className={cx('subscription-channel', selected === 'all' && 'selected')} onClick={() => setSelected('all')}>
              <span className="all-channels-avatar"><UsersRound size={24} /></span><strong>All</strong>
            </button>
            {subscribedChannels.map((channel) => {
              const preference = user.notificationPrefs[channel.id] || 'all';
              const BellIcon = preference === 'none' ? BellOff : preference === 'all' ? BellRing : Bell;
              return (
                <div className={cx('subscription-channel-wrap', selected === channel.id && 'selected')} key={channel.id}>
                  <button className="subscription-channel" onClick={() => setSelected(channel.id)}>
                    <span className="subscription-avatar"><Avatar channel={channel} size="lg" /><i /></span>
                    <strong>{channel.name.split(' ')[0]}</strong>
                  </button>
                  <button className="channel-bell" onClick={() => cycleNotifications(channel.id)} aria-label={`Notifications for ${channel.name}: ${preference}`}><BellIcon size={13} /></button>
                </div>
              );
            })}
          </div>
          <div className="subscription-context">
            <h2>{selected === 'all' ? 'Latest videos' : channelsById[selected].name}<Verified show={selected !== 'all' && channelsById[selected].verified} /></h2>
            <span>{feed.length} videos</span>
          </div>
          {feed.length ? (
            <div className="video-feed">
              {feed.map((video) => <VideoCard key={video.id} video={video} channel={channelsById[video.channelId]} navigate={navigate} onOptions={onOptions} />)}
            </div>
          ) : <EmptyState icon={UsersRound} title="No videos from this channel" description="Check back later for something new." />}
        </>
      ) : (
        <EmptyState icon={UsersRound} title="Find your favorite creators" description="Subscribe to a channel and its latest videos will appear here." action="Explore videos" onAction={() => navigate('home')} />
      )}
    </div>
  );
}
