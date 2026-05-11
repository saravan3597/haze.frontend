import React from 'react';
import './TopBar.css';

interface Props {
  onSettingsClick: () => void;
  onFavoritesClick?: () => void;
}

// Pixelated H mark — 6-row × 9-col block grid.
// Thin bars (2 cols), wide gap (5 cols), prominent 2-row crossbar spanning
// full width. Outer corners of each bar are notched so it reads as an
// abstract geometric mark, not a plain letter H.
//
// Grid (. = empty, # = filled, each block = 10 units in 100×100 viewBox):
//   . # . . . . . # .   row 0 — corner notch
//   # # . . . . . # #   row 1
//   # # # # # # # # #   row 2  ┐ crossbar (2 rows = 33% of height)
//   # # # # # # # # #   row 3  ┘
//   # # . . . . . # #   row 4
//   . # . . . . . # .   row 5 — corner notch
export const HazeMark: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = '#111111',
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {/* Left bar: top notch (col 1), upper body (cols 0-1), lower body, bottom notch */}
    <rect x="15" y="20" width="10" height="10" fill={color} />
    <rect x="5"  y="30" width="20" height="10" fill={color} />
    <rect x="5"  y="60" width="20" height="10" fill={color} />
    <rect x="15" y="70" width="10" height="10" fill={color} />
    {/* Right bar: mirror of left */}
    <rect x="75" y="20" width="10" height="10" fill={color} />
    <rect x="75" y="30" width="20" height="10" fill={color} />
    <rect x="75" y="60" width="20" height="10" fill={color} />
    <rect x="75" y="70" width="10" height="10" fill={color} />
    {/* Full-width crossbar (rows 2-3, cols 0-8) */}
    <rect x="5"  y="40" width="90" height="20" fill={color} />
  </svg>
);

const GearIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const HeartIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const TopBar: React.FC<Props> = ({ onSettingsClick, onFavoritesClick }) => (
  <header className="top-bar">
    <div className="top-bar__inner">
      <button
        className="top-bar__icon-btn"
        onClick={onFavoritesClick}
        aria-label="Favorites"
        style={{ visibility: onFavoritesClick ? 'visible' : 'hidden' }}
      >
        <HeartIcon />
      </button>
      <HazeMark size={26} />
      <button className="top-bar__icon-btn" onClick={onSettingsClick} aria-label="Settings">
        <GearIcon />
      </button>
    </div>
  </header>
);

export default TopBar;
