import { Fragment, useEffect, useMemo, useState } from 'react';
import { categories } from '../data.js';
import VideoCard, { ShortsShelf } from '../components/VideoCard.jsx';
import { EmptyState } from '../components/UI.jsx';
import { SearchX } from 'lucide-react';
import { cx } from '../lib/utils.js';

export default function HomePage({ videos, channelsById, user, navigate, onOptions }) {
  const [category, setCategory] = useState('All');
  const [shelfAfter, setShelfAfter] = useState(2);
  useEffect(() => {
    const update = () => setShelfAfter(window.innerWidth >= 1380 ? 4 : window.innerWidth >= 1024 ? 3 : 2);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const visible = useMemo(() => videos.filter((video) => (
    !user.notInterested.includes(video.id)
    && video.visibility !== 'private'
    && (category === 'All' || video.category === category)
  )), [category, user.notInterested, videos]);

  return (
    <div className="home-page">
      <div className="category-bar" role="tablist" aria-label="Video topics">
        {categories.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={category === item}
            className={cx('category-chip', category === item && 'active')}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="page-content home-content">
        <div className="feed-title">
          <h1>{category === 'All' ? 'Recommended for you' : `${category} picks`}</h1>
          <span>{visible.length} videos</span>
        </div>
        {visible.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nothing here yet"
            description="Try another topic or clear your Not interested choices in Settings."
            action="Show all topics"
            onAction={() => setCategory('All')}
          />
        ) : (
          <div className="video-feed">
            {visible.map((video, index) => (
              <Fragment key={video.id}>
                <VideoCard
                  video={video}
                  channel={channelsById[video.channelId]}
                  navigate={navigate}
                  onOptions={onOptions}
                />
                {index + 1 === shelfAfter && category === 'All' && (
                  <ShortsShelf videos={videos} channelsById={channelsById} navigate={navigate} />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
