import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, Mic, Search, SlidersHorizontal, Trash2, TrendingUp, X } from 'lucide-react';
import { categories, trendingSearches } from '../data.js';
import VideoCard from '../components/VideoCard.jsx';
import { Avatar, EmptyState, IconButton, Sheet, Verified } from '../components/UI.jsx';
import { cx, formatCount } from '../lib/utils.js';

export default function SearchPage({ videos, channels, channelsById, user, actions, navigate, onOptions, goBack, showToast, route }) {
  const [query, setQuery] = useState(route.params.get('q') || '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [duration, setDuration] = useState('any');
  const [category, setCategory] = useState('All');
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    let filtered = videos.filter((video) => {
      if (video.visibility === 'private') return false;
      const channel = channelsById[video.channelId];
      const haystack = [video.title, video.description, video.category, channel.name, ...(video.tags || [])].join(' ').toLowerCase();
      const matches = clean.split(/\s+/).every((word) => haystack.includes(word));
      const matchesDuration = duration === 'any' || (duration === 'short' ? video.duration < 240 : video.duration >= 240);
      return matches && matchesDuration && (category === 'All' || video.category === category);
    });
    if (sort === 'latest') filtered = [...filtered].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (sort === 'views') filtered = [...filtered].sort((a, b) => b.views - a.views);
    return filtered;
  }, [category, channelsById, duration, query, sort, videos]);

  const matchingChannels = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    return channels.filter((channel) => channel.id !== 'you' && `${channel.name} ${channel.handle} ${channel.description}`.toLowerCase().includes(clean)).slice(0, 2);
  }, [channels, query]);

  const submit = (event) => {
    event?.preventDefault();
    if (query.trim()) actions.addRecentSearch(query.trim());
    inputRef.current?.blur();
  };

  const chooseSearch = (value) => {
    setQuery(value);
    actions.addRecentSearch(value);
  };

  const startVoiceSearch = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      showToast('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = false;
    showToast('Listening…');
    recognition.onresult = (event) => chooseSearch(event.results[0][0].transcript);
    recognition.onerror = () => showToast('I couldn’t hear that. Try again or type your search.');
    recognition.start();
  };

  return (
    <div className="search-page">
      <form className="search-header" onSubmit={submit}>
        <IconButton label="Back" type="button" onClick={goBack}><ArrowLeft size={23} /></IconButton>
        <label className="search-input-wrap">
          <Search size={19} />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search MyTube"
            aria-label="Search videos"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={18} /></button>}
        </label>
        <IconButton label="Voice search" type="button" onClick={startVoiceSearch}><Mic size={21} /></IconButton>
      </form>
      <div className="search-filter-row">
        <span>{query ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Discover something new'}</span>
        <button onClick={() => setFilterOpen(true)}><SlidersHorizontal size={17} /> Filters{(sort !== 'relevance' || duration !== 'any' || category !== 'All') && <i />}</button>
      </div>

      <div className="page-content search-content">
        {!query.trim() ? (
          <div className="search-discovery">
            {user.recentSearches.length > 0 && (
              <section>
                <div className="section-heading"><h2>Recent searches</h2><button onClick={actions.clearRecentSearches}>Clear all</button></div>
                <div className="recent-searches">
                  {user.recentSearches.map((item) => (
                    <button key={item} onClick={() => chooseSearch(item)}><Clock3 size={18} /><span>{item}</span></button>
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="section-heading"><h2>Trending on MyTube</h2><TrendingUp size={20} /></div>
              <div className="trending-list">
                {trendingSearches.map((item, index) => (
                  <button key={item} onClick={() => chooseSearch(item)}><span>{index + 1}</span><strong>{item}</strong><Search size={17} /></button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            {matchingChannels.map((channel) => (
              <div className="channel-search-result" key={channel.id}>
                <button onClick={() => navigate(`channel/${channel.id}`)}><Avatar channel={channel} size="lg" /></button>
                <button className="channel-search-copy" onClick={() => navigate(`channel/${channel.id}`)}>
                  <strong>{channel.name}<Verified show={channel.verified} /></strong>
                  <span>{channel.handle} · {formatCount(channel.subscribers)} subscribers</span>
                  <small>{channel.description}</small>
                </button>
                <button
                  className={cx('button', user.subscribed.includes(channel.id) ? 'button-secondary' : 'button-primary')}
                  onClick={() => actions.toggleSubscription(channel.id)}
                >
                  {user.subscribed.includes(channel.id) ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
            ))}
            {results.length ? (
              <div className="video-feed search-results">
                {results.map((video) => (
                  <VideoCard key={video.id} video={video} channel={channelsById[video.channelId]} navigate={navigate} onOptions={onOptions} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Search} title="No matches found" description="Try different keywords or remove a filter." action="Reset filters" onAction={() => { setSort('relevance'); setDuration('any'); setCategory('All'); }} />
            )}
          </>
        )}
      </div>

      {filterOpen && (
        <Sheet title="Search filters" onClose={() => setFilterOpen(false)}>
          <div className="filter-group"><h3>Sort by</h3><div className="filter-options">{[['relevance', 'Relevance'], ['latest', 'Upload date'], ['views', 'View count']].map(([value, label]) => <button key={value} className={sort === value ? 'selected' : ''} onClick={() => setSort(value)}>{label}</button>)}</div></div>
          <div className="filter-group"><h3>Duration</h3><div className="filter-options">{[['any', 'Any length'], ['short', 'Under 4 minutes'], ['long', '4 minutes and over']].map(([value, label]) => <button key={value} className={duration === value ? 'selected' : ''} onClick={() => setDuration(value)}>{label}</button>)}</div></div>
          <div className="filter-group"><h3>Topic</h3><div className="filter-options wrap">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
          <button className="button button-primary button-full" onClick={() => setFilterOpen(false)}>Show {results.length} results</button>
        </Sheet>
      )}
    </div>
  );
}
