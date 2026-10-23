import {
  Bell,
  Clock3,
  Film,
  History,
  Home,
  Library,
  Menu,
  Plus,
  Search,
  Settings,
  ThumbsUp,
  Upload,
  UsersRound,
} from 'lucide-react';
import { Avatar, IconButton, Logo } from './UI.jsx';
import { cx } from '../lib/utils.js';

export function Header({ route, navigate, unreadCount, onNotifications, onMenu, channel }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <IconButton label="Open navigation" className="desktop-menu" onClick={onMenu}><Menu size={23} /></IconButton>
        <Logo onClick={() => navigate('home')} />
      </div>
      <button className="header-search-wide" onClick={() => navigate('search')}>
        <Search size={18} />
        <span>Search videos, channels, and topics</span>
      </button>
      <div className="header-actions">
        <IconButton label="Search" className="mobile-search" onClick={() => navigate('search')}><Search size={23} /></IconButton>
        <IconButton
          label="Notifications"
          badge={unreadCount}
          onClick={onNotifications}
          className={route.name === 'notifications' ? 'active' : ''}
        >
          <Bell size={22} />
        </IconButton>
        <button className="profile-button" onClick={() => navigate('library')} aria-label="Your profile and library">
          <Avatar channel={channel} size="sm" />
        </button>
      </div>
    </header>
  );
}

const mainItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'shorts', label: 'Shorts', icon: Film },
  { id: 'subscriptions', label: 'Subscriptions', icon: UsersRound },
  { id: 'library', label: 'You', icon: Library },
];

export function BottomNav({ route, navigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {mainItems.slice(0, 2).map(({ id, label, icon: Icon }) => (
        <button key={id} className={cx(route.name === id && 'active')} onClick={() => navigate(id)}>
          <Icon size={22} fill={route.name === id && id === 'home' ? 'currentColor' : 'none'} />
          <span>{label}</span>
        </button>
      ))}
      <button className="create-nav" onClick={() => navigate('upload')} aria-label="Create or upload a video">
        <span><Plus size={28} /></span>
        <small>Create</small>
      </button>
      {mainItems.slice(2).map(({ id, label, icon: Icon }) => (
        <button key={id} className={cx((route.name === id || (id === 'library' && ['collection', 'playlist'].includes(route.name))) && 'active')} onClick={() => navigate(id)}>
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function DesktopSidebar({ route, navigate, collapsed, onSettings }) {
  const secondary = [
    { id: 'collection/history', label: 'History', icon: History, match: 'history' },
    { id: 'collection/watch-later', label: 'Watch later', icon: Clock3, match: 'watch-later' },
    { id: 'collection/liked', label: 'Liked videos', icon: ThumbsUp, match: 'liked' },
    { id: 'upload', label: 'Your videos', icon: Upload, match: 'upload' },
  ];
  return (
    <aside className={cx('desktop-sidebar', collapsed && 'collapsed')}>
      <div className="sidebar-group">
        {mainItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={cx(route.name === id && 'active')} onClick={() => navigate(id)} title={label}>
            <Icon size={21} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-group">
        {!collapsed && <p className="sidebar-label">Your space</p>}
        {secondary.map(({ id, label, icon: Icon, match }) => (
          <button key={id} className={cx((route.id === match || route.name === match) && 'active')} onClick={() => navigate(id)} title={label}>
            <Icon size={21} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-group sidebar-bottom">
        <button onClick={onSettings} title="Settings"><Settings size={21} /><span>Settings</span></button>
        {!collapsed && <p className="sidebar-note">A local-first video experience.<br />Not affiliated with YouTube.</p>}
      </div>
    </aside>
  );
}
