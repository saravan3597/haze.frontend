import React from 'react';
import './WallpaperSheet.css';

interface Props {
  onClose: () => void;
}

const WallpaperSheet: React.FC<Props> = ({ onClose }) => (
  <>
    <div className="wallpaper-sheet__backdrop" onClick={onClose} />
    <div className="wallpaper-sheet">
      <div className="wallpaper-sheet__handle" />
      <p className="wallpaper-sheet__title">Set as Wallpaper</p>
      <p className="wallpaper-sheet__body">
        iOS doesn't allow apps to set wallpapers directly. We've saved it to
        your Photos — here's how to finish:
      </p>
      <ol className="wallpaper-sheet__steps">
        <li>Open the <strong>Photos</strong> app</li>
        <li>Find your saved Haze wallpaper</li>
        <li>Tap the <strong>Share</strong> icon ↑</li>
        <li>Scroll down and tap <strong>Use as Wallpaper</strong></li>
      </ol>
      <button className="wallpaper-sheet__btn" onClick={onClose}>
        Got it
      </button>
    </div>
  </>
);

export default WallpaperSheet;
