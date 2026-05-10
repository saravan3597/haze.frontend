import React from 'react';
import './ActionBar.css';

interface Props {
  onSave: () => void;
  onSetWallpaper: () => void;
  saving: boolean;
}

const SaveIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const WallpaperIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="0" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ActionBar: React.FC<Props> = ({ onSave, onSetWallpaper, saving }) => (
  <div className="action-bar">
    <button className="action-bar__btn" onClick={onSave} disabled={saving}>
      <SaveIcon />
      <span>{saving ? 'Saving…' : 'Save to Photos'}</span>
    </button>
    <div className="action-bar__divider" />
    <button className="action-bar__btn" onClick={onSetWallpaper} disabled={saving}>
      <WallpaperIcon />
      <span>Set as Wallpaper</span>
    </button>
  </div>
);

export default ActionBar;
