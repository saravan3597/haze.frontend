import React, { useRef, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './ActionBar.css';

interface Props {
  onGenerate: () => void;
  onSave: () => void;
  onSetWallpaper: () => void;
  onFavorite?: () => void;
  favorited?: boolean;
  saving: boolean;
}

const haptic = () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, onClick, disabled }) => {
  const [tooltip, setTooltip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLong = useRef(false);

  const handleTouchStart = () => {
    isLong.current = false;
    timer.current = setTimeout(() => {
      isLong.current = true;
      haptic();
      setTooltip(true);
      setTimeout(() => setTooltip(false), 1200);
    }, 450);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // prevent synthetic click from double-firing
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (!isLong.current && !disabled) {
      haptic();
      onClick();
    }
  };

  return (
    <button
      className="action-bar__btn"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick} // desktop fallback (no touch events)
      disabled={disabled}
      aria-label={label}
    >
      {tooltip && <div className="action-bar__tooltip">{label}</div>}
      {icon}
    </button>
  );
};

const GenerateIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const SaveIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const WallpaperIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="0" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const HeartIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#111111' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ActionBar: React.FC<Props> = ({ onGenerate, onSave, onSetWallpaper, onFavorite, favorited = false, saving }) => (
  <div className="action-bar">
    <ActionBtn icon={<GenerateIcon />} label="Generate" onClick={onGenerate} disabled={saving} />
    <div className="action-bar__divider" />
    <ActionBtn icon={<SaveIcon />} label="Save" onClick={onSave} disabled={saving} />
    {onFavorite && (
      <>
        <div className="action-bar__divider" />
        <ActionBtn icon={<HeartIcon filled={favorited} />} label={favorited ? 'Saved' : 'Favorite'} onClick={onFavorite} disabled={saving} />
      </>
    )}
    <div className="action-bar__divider" />
    <ActionBtn icon={<WallpaperIcon />} label="Set Wallpaper" onClick={onSetWallpaper} disabled={saving} />
  </div>
);

export default ActionBar;
