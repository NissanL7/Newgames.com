import { useRef } from 'react';
import { Bookmark, Check, Play, Sparkles } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { AnimatedNumber, WordReveal, premiumEase } from './Motion.jsx';
import { Avatar, Verified } from './UI.jsx';
import { formatDuration } from '../lib/utils.js';

export default function HomeHero({ video, channel, navigate, onSave, saved }) {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(40);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 48]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const spotlight = useMotionTemplate`radial-gradient(560px circle at ${pointerX}% ${pointerY}%, rgba(255,85,120,0.22), transparent 68%)`;
  const [mainTitle, ...subtitleParts] = video.title.split('—');
  const subtitle = subtitleParts.join('—').trim();

  return (
    <section
      className="home-hero"
      ref={sectionRef}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        const bounds = sectionRef.current?.getBoundingClientRect();
        if (!bounds) return;
        pointerX.set(((event.clientX - bounds.left) / bounds.width) * 100);
        pointerY.set(((event.clientY - bounds.top) / bounds.height) * 100);
      }}
      aria-labelledby="featured-title"
    >
      <motion.div className="hero-media" style={reduced ? undefined : { y: imageY, scale: imageScale }}>
        <img src={video.thumbnail} alt="" fetchPriority="high" />
      </motion.div>
      <div className="hero-color-wash" />
      <motion.div className="hero-spotlight" style={{ background: spotlight }} />
      <div className="hero-noise" />

      <motion.div className="hero-content" style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}>
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: premiumEase }}
        >
          <span><Sparkles size={13} /> Featured premiere</span>
          <i />
          <span>{video.category}</span>
        </motion.div>
        <h1 id="featured-title"><WordReveal text={mainTitle.trim()} /></h1>
        {subtitle && (
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.55, ease: premiumEase }}
          >
            {subtitle}
          </motion.p>
        )}
        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.55, ease: premiumEase }}
        >
          {video.description}
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.55, ease: premiumEase }}
        >
          <button className="hero-play" onClick={() => navigate(`watch/${video.id}`)}><Play size={19} fill="currentColor" /> Play now</button>
          <button className={`hero-save ${saved ? 'saved' : ''}`} onClick={() => onSave(video)}>{saved ? <Check size={18} /> : <Bookmark size={18} />}{saved ? 'Saved' : 'Watch Later'}</button>
        </motion.div>
        <motion.button
          className="hero-channel"
          onClick={() => navigate(`channel/${channel.id}`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Avatar channel={channel} size="sm" />
          <span><strong>{channel.name}<Verified show={channel.verified} /></strong><small><AnimatedNumber value={video.views} /> views · {formatDuration(video.duration)}</small></span>
        </motion.button>
      </motion.div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>Scroll to explore</span><i /></div>
      <span className="hero-index" aria-hidden="true">01 / FEATURED</span>
    </section>
  );
}
