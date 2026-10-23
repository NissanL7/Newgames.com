import { useMemo, useState } from 'react';
import { ArrowDownUp, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { getSeedComments } from '../data.js';
import { Avatar } from './UI.jsx';
import { formatCount } from '../lib/utils.js';

export default function Comments({ video, user, actions, expanded = true }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [sort, setSort] = useState('top');
  const [visibleCount, setVisibleCount] = useState(expanded ? 4 : 3);

  const comments = useMemo(() => {
    const personal = user.comments[video.id] || [];
    const all = [...personal, ...getSeedComments(video.id)];
    if (sort === 'top') return [...all].sort((a, b) => b.likes - a.likes);
    return all;
  }, [sort, user.comments, video.id]);

  const submit = () => {
    const clean = text.trim();
    if (!clean) return;
    actions.addComment(video.id, clean);
    setSort('newest');
    setVisibleCount((count) => Math.max(count, 4));
    setText('');
    setFocused(false);
  };

  return (
    <section className="comments-section" aria-labelledby={`comments-${video.id}`}>
      <div className="comments-heading">
        <h2 id={`comments-${video.id}`}>{formatCount(comments.length)} Comments</h2>
        <button onClick={() => setSort((value) => value === 'top' ? 'newest' : 'top')}>
          <ArrowDownUp size={17} /> {sort === 'top' ? 'Top' : 'Newest'}
        </button>
      </div>
      <div className="comment-composer">
        <Avatar name="Alex Viewer" color="#7c3aed" size="sm" />
        <div className="comment-input-wrap">
          <textarea
            value={text}
            rows={focused || text ? 2 : 1}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            maxLength={1000}
            onFocus={() => setFocused(true)}
            onChange={(event) => setText(event.target.value)}
          />
          {(focused || text) && (
            <div className="comment-composer-actions">
              <button onClick={() => { setFocused(false); setText(''); }}>Cancel</button>
              <button className="button button-primary" disabled={!text.trim()} onClick={submit}>Comment</button>
            </div>
          )}
        </div>
      </div>
      <p className="local-note">Your new comments are saved on this device.</p>
      <div className="comment-list">
        {comments.slice(0, visibleCount).map((comment) => {
          const liked = user.likedComments.includes(comment.id);
          const disliked = user.dislikedComments.includes(comment.id);
          return (
            <article className="comment" key={comment.id}>
              <Avatar name={comment.author} color={comment.color} size="sm" />
              <div className="comment-body">
                <p className="comment-author">{comment.handle} <span>{comment.createdAt}</span>{comment.local && <em>You</em>}</p>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button className={liked ? 'active' : ''} onClick={() => actions.toggleCommentLike(comment.id)} aria-label="Like comment">
                    <ThumbsUp size={15} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <span>{formatCount(comment.likes + (liked ? 1 : 0))}</span>
                  <button className={disliked ? 'active' : ''} onClick={() => actions.toggleCommentDislike(comment.id)} aria-label="Dislike comment"><ThumbsDown size={15} fill={disliked ? 'currentColor' : 'none'} /></button>
                  <button className="reply-button" onClick={() => { setFocused(true); setText(`${comment.handle} `); }}>Reply</button>
                </div>
              </div>
              {comment.local && <button className="comment-more" onClick={() => actions.deleteComment(video.id, comment.id)} aria-label="Delete your comment"><Trash2 size={16} /></button>}
            </article>
          );
        })}
      </div>
      {visibleCount < comments.length && (
        <button className="text-button show-more-comments" onClick={() => setVisibleCount(comments.length)}>Show more comments</button>
      )}
    </section>
  );
}
