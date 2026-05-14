import React, { useCallback, useEffect, useRef } from 'react';
import { IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { WALLPAPER_WIDTH, WALLPAPER_HEIGHT } from '../utils/canvasExport';
import { draw as drawGradient } from '../generators/gradient';
import { draw as drawColorblocks } from '../generators/colorblocks';
import { useSaveWallpaper } from '../hooks/useSaveWallpaper';
import ConfirmationBar from '../components/ConfirmationBar';
import WallpaperSheet from '../components/WallpaperSheet';
import type { StyleId, ResolvedPalette } from '../hooks/useWallpaperGenerator';
import './FavoritesViewer.css';

export interface FavoritesViewerState {
  style: StyleId;
  seed: number;
  palette: ResolvedPalette;
}

const haptic = () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

const FavoritesViewer: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ viewer?: FavoritesViewerState }>();
  // Snapshot on mount — prevents the guard from firing during back-navigation
  // when location.state momentarily becomes undefined mid-transition.
  const stateRef = useRef(location.state?.viewer);
  const state = stateRef.current;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!state) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = WALLPAPER_WIDTH;
    canvas.height = WALLPAPER_HEIGHT;
    if (state.style === 'gradient') {
      drawGradient(canvas, state.seed, state.palette);
    } else {
      drawColorblocks(canvas, state.seed, state.palette);
    }
  }, [state]);

  const getCanvas = useCallback(() => canvasRef.current, []);
  const { state: saveState, handleSave, handleSetWallpaper, showIOSSheet, setShowIOSSheet } =
    useSaveWallpaper(getCanvas);

  const confirmMessage =
    saveState.type === 'success' ? saveState.message :
    saveState.type === 'error' ? saveState.message : null;

  // Guard: if navigated here without state, go back
  if (!state) {
    history.replace('/favorites');
    return null;
  }

  return (
    <IonPage className="fav-viewer-page">
      <div className="fav-viewer-topbar">
        <button
          className="fav-viewer-back"
          onClick={() => { haptic(); history.goBack(); }}
          aria-label="Back to Favorites"
        >
          <BackIcon />
        </button>
      </div>

      <div className="fav-viewer-canvas-wrap">
        <canvas ref={canvasRef} className="fav-viewer-canvas" />
      </div>

      <div className="fav-viewer-bottom">
        <ConfirmationBar message={confirmMessage} />
        <div className="fav-viewer-actions">
          <button
            className="fav-viewer-btn"
            onClick={() => { haptic(); handleSave(); }}
            onTouchStart={haptic}
            disabled={saveState.type === 'saving'}
          >
            <SaveIcon />
            Save to Photos
          </button>
          <div className="fav-viewer-actions__divider" />
          <button
            className="fav-viewer-btn"
            onClick={() => { haptic(); handleSetWallpaper(); }}
            onTouchStart={haptic}
            disabled={saveState.type === 'saving'}
          >
            <WallpaperIcon />
            Set as Wallpaper
          </button>
        </div>
      </div>

      {showIOSSheet && <WallpaperSheet onClose={() => setShowIOSSheet(false)} />}
    </IonPage>
  );
};

const BackIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

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

export default FavoritesViewer;
