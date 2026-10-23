import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { formatCount } from '../lib/utils.js';

export const premiumEase = [0.22, 1, 0.36, 1];

export function PageTransition({ children }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="page-transition"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduced ? 0.12 : 0.28, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({ children, className = '', delay = 0, amount = 0.14 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.15 : 0.58, delay: reduced ? 0 : delay, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}

export function WordReveal({ text, className = '' }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={`word-reveal ${className}`}
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.065, delayChildren: 0.12 } } }}
    >
      {text.split(' ').map((word, index) => (
        <span className="word-mask" aria-hidden="true" key={`${word}-${index}`}>
          <motion.span
            variants={{
              hidden: { y: '110%', opacity: 0, rotate: 2 },
              visible: { y: '0%', opacity: 1, rotate: 0, transition: { duration: 0.62, ease: premiumEase } },
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function AnimatedNumber({ value, formatter = formatCount, className = '' }) {
  const reduced = useReducedMotion();
  const number = useMotionValue(0);
  const spring = useSpring(number, { stiffness: 85, damping: 22, mass: 0.7 });
  const display = useTransform(spring, (latest) => formatter(Math.max(0, Math.round(latest))));
  useEffect(() => { number.set(Number.isFinite(value) ? value : 0); }, [number, value]);
  if (reduced) return <span className={className}>{formatter(value)}</span>;
  return <motion.span className={className}>{display}</motion.span>;
}

export function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      <span className="ambient-grid" />
      <span className="ambient-orb ambient-orb-one" />
      <span className="ambient-orb ambient-orb-two" />
      <span className="ambient-noise" />
    </div>
  );
}
