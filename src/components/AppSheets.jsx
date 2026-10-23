import { useState } from 'react';
import {
  Ban,
  Bell,
  Bookmark,
  Check,
  Copy,
  Download,
  ExternalLink,
  FolderPlus,
  ListPlus,
  Moon,
  Plus,
  Share2,
  Smartphone,
  Sun,
  Trash2,
} from 'lucide-react';
import { notifications } from '../data.js';
import Comments from './Comments.jsx';
import { Avatar, Sheet, Toggle, Verified } from './UI.jsx';
import { copyText, cx } from '../lib/utils.js';

function OptionButton({ icon: Icon, title, description, onClick, danger = false, selected = false }) {
  return (
    <button className={cx('sheet-option', danger && 'danger', selected && 'selected')} onClick={onClick}>
      <span className="sheet-option-icon"><Icon size={21} /></span>
      <span><strong>{title}</strong>{description && <small>{description}</small>}</span>
      {selected && <Check size={19} />}
    </button>
  );
}

function CreatePlaylistForm({ video, actions, setSheet, close, showToast }) {
  const [name, setName] = useState('');
  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    actions.createPlaylist(name.trim(), video?.id);
    showToast(video ? `Saved to “${name.trim()}”` : `Playlist “${name.trim()}” created`);
    close();
  };
  return (
    <form className="create-playlist-form" onSubmit={submit}>
      <label className="form-field"><span>Playlist name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="e.g. Sunday movie night" /></label>
      <p>Playlists are private and stored on this device.</p>
      <div className="sheet-form-actions"><button type="button" className="button button-secondary" onClick={() => video ? setSheet({ type: 'save', video }) : close()}>Cancel</button><button className="button button-primary" disabled={!name.trim()}>Create playlist</button></div>
    </form>
  );
}

export default function AppSheets({ sheet, setSheet, close, user, actions, channelsById, navigate, showToast, onShare, onDownload, installApp }) {
  if (!sheet) return null;
  const video = sheet.video;

  if (sheet.type === 'create-playlist') {
    return <Sheet title="New playlist" onClose={close}><CreatePlaylistForm video={video} actions={actions} setSheet={setSheet} close={close} showToast={showToast} /></Sheet>;
  }

  if (sheet.type === 'options' && video) {
    const saved = user.watchLater.includes(video.id);
    return (
      <Sheet title="Video options" subtitle={video.title} onClose={close}>
        <div className="sheet-options">
          <OptionButton icon={Bookmark} title={saved ? 'Remove from Watch Later' : 'Save to Watch Later'} selected={saved} onClick={() => { actions.toggleWatchLater(video.id); showToast(saved ? 'Removed from Watch Later' : 'Saved to Watch Later'); close(); }} />
          <OptionButton icon={ListPlus} title="Save to playlist" description="Add this video to one of your collections" onClick={() => setSheet({ type: 'save', video })} />
          <OptionButton icon={Share2} title="Share" description="Copy or share a link to this video" onClick={() => onShare(video)} />
          <OptionButton icon={Download} title="Download source" description={video.local ? 'Save a copy from this device' : 'Open the sample video source'} onClick={() => { close(); onDownload(video); }} />
          <OptionButton icon={Ban} title="Not interested" description="Hide this video from your Home feed" onClick={() => { actions.notInterested(video.id); showToast('We’ll show fewer videos like this'); close(); }} />
          {video.local && <OptionButton icon={Trash2} title="Delete from this device" description="This cannot be undone" danger onClick={() => setSheet({ type: 'delete-upload', video })} />}
        </div>
      </Sheet>
    );
  }

  if (sheet.type === 'save' && video) {
    const inWatchLater = user.watchLater.includes(video.id);
    return (
      <Sheet title="Save video to…" subtitle={video.title} onClose={close}>
        <div className="save-playlist-list">
          <button onClick={() => actions.toggleWatchLater(video.id)}><span className="playlist-check-icon"><Bookmark size={20} /></span><strong>Watch Later</strong><span className={cx('check-box', inWatchLater && 'checked')}>{inWatchLater && <Check size={15} />}</span></button>
          {user.playlists.map((playlist) => {
            const included = playlist.videoIds.includes(video.id);
            return <button key={playlist.id} onClick={() => actions.togglePlaylistVideo(playlist.id, video.id)}><span className="playlist-check-icon"><ListPlus size={20} /></span><span><strong>{playlist.name}</strong><small>{playlist.videoIds.length} videos</small></span><span className={cx('check-box', included && 'checked')}>{included && <Check size={15} />}</span></button>;
          })}
        </div>
        <button className="button button-secondary button-full" onClick={() => setSheet({ type: 'create-playlist', video })}><FolderPlus size={18} /> Create a new playlist</button>
        <button className="button button-primary button-full" onClick={close}>Done</button>
      </Sheet>
    );
  }

  if (sheet.type === 'notifications') {
    const unread = notifications.filter((item) => !user.readNotifications.includes(item.id)).length;
    return (
      <Sheet title="Notifications" subtitle={unread ? `${unread} unread updates` : 'You’re all caught up'} onClose={close}>
        {unread > 0 && <button className="text-button mark-read-button" onClick={actions.markAllNotificationsRead}><Check size={16} /> Mark all as read</button>}
        <div className="notification-list">
          {notifications.map((item) => {
            const channel = channelsById[item.channelId];
            const itemVideo = sheet.videosById[item.videoId];
            const read = user.readNotifications.includes(item.id);
            return (
              <button className={cx('notification-item', !read && 'unread')} key={item.id} onClick={() => { actions.markNotificationRead(item.id); close(); navigate(`watch/${item.videoId}`); }}>
                <Avatar channel={channel} size="md" />
                <span><strong>{item.text}</strong><small>{item.time}</small></span>
                {itemVideo && <img src={itemVideo.thumbnail} alt="" />}
                {!read && <i />}
              </button>
            );
          })}
        </div>
        <p className="local-note">Demo notifications are generated locally. Channel bells control your preferences, not a remote account.</p>
      </Sheet>
    );
  }

  if (sheet.type === 'settings') {
    return (
      <Sheet title="Settings" subtitle="Make MyTube work your way" onClose={close} className="settings-sheet">
        <div className="settings-group"><h3>Appearance</h3><div className="theme-options">{[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Smartphone]].map(([value, label, Icon]) => <button key={value} className={user.settings.theme === value ? 'selected' : ''} onClick={() => actions.updateSettings({ theme: value })}><Icon size={19} /><span>{label}</span>{user.settings.theme === value && <Check size={15} />}</button>)}</div></div>
        <div className="settings-group"><h3>Playback</h3><Toggle label="Autoplay Shorts" description="Play the visible Short automatically" checked={user.settings.autoplayShorts} onChange={(value) => actions.updateSettings({ autoplayShorts: value })} /><Toggle label="Data saver" description="Load regular video data only when needed" checked={user.settings.dataSaver} onChange={(value) => actions.updateSettings({ dataSaver: value })} /><Toggle label="Reduce motion" description="Minimize interface animations" checked={user.settings.reduceMotion} onChange={(value) => actions.updateSettings({ reduceMotion: value })} /></div>
        <div className="settings-group"><h3>Your data</h3><OptionButton icon={Trash2} title="Clear watch history" onClick={() => { actions.clearHistory(); showToast('Watch history cleared'); }} /><OptionButton icon={Ban} title="Reset Not interested" description={`${user.notInterested.length} hidden videos`} onClick={() => { actions.resetNotInterested(); showToast('Recommendation resets cleared'); }} />{installApp && <OptionButton icon={Smartphone} title="Install MyTube" description="Add the app to your home screen" onClick={installApp} />}</div>
        <div className="about-app"><strong>MyTube 1.0</strong><p>An independent, local-first video app demo. It is not affiliated with YouTube and does not sign in to or synchronize with a YouTube account.</p><span>Catalog playback uses openly hosted sample videos. Your personal activity stays in this browser.</span></div>
      </Sheet>
    );
  }

  if (sheet.type === 'comments' && video) {
    return <Sheet title="Comments" subtitle={video.title} onClose={close} className="comments-sheet"><Comments video={video} user={user} actions={actions} expanded={false} /></Sheet>;
  }

  if (sheet.type === 'share' && video) {
    const url = `${window.location.origin}${window.location.pathname}#/watch/${encodeURIComponent(video.id)}`;
    return (
      <Sheet title="Share video" subtitle={video.title} onClose={close}>
        <div className="share-preview"><img src={video.thumbnail} alt="" /><span><strong>{video.title}</strong><small>{channelsById[video.channelId].name}</small></span></div>
        <label className="share-link"><span>Video link</span><div><input readOnly value={url} onFocus={(event) => event.target.select()} /><button onClick={async () => { await copyText(url); showToast('Link copied'); }} aria-label="Copy video link"><Copy size={19} /></button></div></label>
        <button className="button button-primary button-full" onClick={async () => { await copyText(url); showToast('Link copied to clipboard'); close(); }}><Copy size={18} /> Copy link</button>
        {navigator.share && <button className="button button-secondary button-full" onClick={() => onShare(video, true)}><ExternalLink size={18} /> More sharing options</button>}
      </Sheet>
    );
  }

  if (sheet.type === 'delete-upload' && video) {
    return (
      <Sheet title="Delete this video?" onClose={close}>
        <p className="delete-warning">“{video.title}” and its local media file will be permanently removed from this browser.</p>
        <div className="sheet-form-actions"><button className="button button-secondary" onClick={close}>Cancel</button><button className="button button-danger" onClick={async () => { await actions.deleteUpload(video.id); close(); navigate('collection/uploads'); showToast('Video deleted from this device'); }}><Trash2 size={18} /> Delete video</button></div>
      </Sheet>
    );
  }

  return null;
}
