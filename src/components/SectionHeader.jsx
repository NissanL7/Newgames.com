import { ChevronLeft } from 'lucide-react';
import { IconButton } from './UI.jsx';

export default function SectionHeader({ title, subtitle, onBack, children }) {
  return (
    <div className="section-page-header">
      <div className="section-page-title">
        {onBack && <IconButton label="Go back" onClick={onBack}><ChevronLeft size={25} /></IconButton>}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children && <div className="section-page-actions">{children}</div>}
    </div>
  );
}
