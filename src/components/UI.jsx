import { useEffect } from 'react';
import { BadgeCheck, Play, X } from 'lucide-react';
import { cx, initials } from '../lib/utils.js';
import { motion, useReducedMotion } from 'motion/react';
import { premiumEase } from './Motion.jsx';

export function Logo({ compact = false, onClick }) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true"><Play size={compact ? 15 : 17} fill="currentColor" /></span>
      {!compact && <span className="brand-word">MyTube</span>}
    </>
  );
  return onClick ? (
    <button className="brand" onClick={onClick} aria-label="MyTube home">{content}</button>
  ) : <div className="brand">{content}</div>;
}

export function Avatar({ channel, name, color, size = 'md', className = '' }) {
  const displayName = channel?.name || name || 'Viewer';
  const background = channel?.color || color || '#7c3aed';
  return (
    <span
      className={cx('avatar', `avatar-${size}`, className)}
      style={{ '--avatar-color': background }}
      aria-hidden="true"
    >
      {initials(displayName)}
    </span>
  );
}

export function Verified({ show = true }) {
  return show ? <BadgeCheck className="verified" size={14} fill="currentColor" aria-label="Verified" /> : null;
}

export function IconButton({ label, children, className = '', badge, ...props }) {
  return (
    <button className={cx('icon-button', className)} aria-label={label} title={label} {...props}>
      {children}
      {badge > 0 && <span className="icon-badge">{badge > 9 ? '9+' : badge}</span>}
    </button>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-track" aria-hidden="true"><span /></span>
    </label>
  );
}

export function Sheet({ title, subtitle, onClose, children, className = '' }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="sheet-layer" role="presentation">
      <motion.button className="sheet-backdrop" onClick={onClose} aria-label="Close dialog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />
      <motion.section
        className={cx('sheet', className)}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduced ? 0.15 : 0.3, ease: premiumEase }}
      >
        <div className="sheet-handle" aria-hidden="true" />
        {(title || onClose) && (
          <header className="sheet-header">
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            <IconButton label="Close" onClick={onClose}><X size={22} /></IconButton>
          </header>
        )}
        <div className="sheet-content">{children}</div>
      </motion.section>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="empty-state">
      {Icon && <span className="empty-icon"><Icon size={30} /></span>}
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <button className="button button-primary" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification"><X size={17} /></button>
    </div>
  );
}

export function LoadingThumb() {
  return <div className="thumb-fallback"><Play size={30} fill="currentColor" /></div>;
}
