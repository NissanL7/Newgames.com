import { ArrowDown } from 'lucide-react';

export default function Logo({ dark = false }) {
  return (
    <a className={`brand ${dark ? 'brand-dark' : ''}`} href="#top" aria-label="Savr home">
      <span className="brand-mark" aria-hidden="true"><ArrowDown size={20} strokeWidth={3} /></span>
      <span>savr<span className="brand-dot">.</span></span>
    </a>
  );
}
