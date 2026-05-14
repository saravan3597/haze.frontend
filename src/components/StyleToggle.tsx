import React, { useEffect, useRef } from 'react';
import { SectionId } from '../hooks/useWallpaperGenerator';
import './StyleToggle.css';

const SparkleIcon: React.FC = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 4, flexShrink: 0 }}>
    <path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" />
  </svg>
);

const BetaBadge: React.FC = () => (
  <span style={{
    marginLeft: 5,
    padding: '2px 4px',
    fontFamily: "'Source Sans Pro', -apple-system, sans-serif",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#ffffff',
    background: '#000000',
    borderRadius: 0,
    lineHeight: 1,
    verticalAlign: 'middle',
    display: 'inline-block',
  }}>BETA</span>
);

const SECTIONS: { id: SectionId; label: string; icon?: React.ReactNode; badge?: React.ReactNode }[] = [
  { id: 'ai',          label: 'AI',           icon: <SparkleIcon />, badge: <BetaBadge /> },
  { id: 'gradient',    label: 'Gradient'                                                   },
  { id: 'colorblocks', label: 'Color Blocks'                                               },
  { id: 'dotgrid',     label: 'Dot Grid'                                                   },
];

interface Props {
  value: SectionId;
  onChange: (id: SectionId) => void;
}

const StyleToggle: React.FC<Props> = ({ value, onChange }) => {
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Map<SectionId, HTMLButtonElement | null>>(new Map());

  // Scroll active tab into view whenever value changes (tap OR swipe)
  useEffect(() => {
    const nav = navRef.current;
    const tab = tabRefs.current.get(value);
    if (!nav || !tab) return;

    const tabLeft  = tab.offsetLeft;
    const tabRight = tabLeft + tab.offsetWidth;
    const navLeft  = nav.scrollLeft;
    const navRight = navLeft + nav.offsetWidth;

    if (tabRight > navRight - 20) {
      nav.scrollTo({ left: tabRight - nav.offsetWidth + 20, behavior: 'smooth' });
    } else if (tabLeft < navLeft + 20) {
      nav.scrollTo({ left: tabLeft - 20, behavior: 'smooth' });
    }
  }, [value]);

  return (
    <nav className="style-toggle" ref={navRef}>
      {SECTIONS.map(({ id, label, icon, badge }) => (
        <button
          key={id}
          ref={(el) => { tabRefs.current.set(id, el); }}
          className={`style-toggle__tab${value === id ? ' style-toggle__tab--active' : ''}`}
          onClick={() => onChange(id)}
        >
          {icon}{label}{badge}
        </button>
      ))}
      <span className="style-toggle__end-spacer" aria-hidden="true" />
    </nav>
  );
};

export default StyleToggle;
