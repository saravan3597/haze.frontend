import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonPage, IonAlert } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar';
import StyleToggle from '../components/StyleToggle';
import ActionBar from '../components/ActionBar';
import ConfirmationBar from '../components/ConfirmationBar';
import WallpaperSheet from '../components/WallpaperSheet';
import {
  useWallpaperGenerator,
  PalettePref,
  ResolvedPalette,
  GENERATORS,
  resolvePalette,
  StyleId,
} from '../hooks/useWallpaperGenerator';
import { useSwipeRefresh } from '../hooks/useSwipeRefresh';
import { useSaveWallpaper } from '../hooks/useSaveWallpaper';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const PALETTE_KEY = 'haze_palette';

function loadPalette(): PalettePref {
  return (localStorage.getItem(PALETTE_KEY) as PalettePref) ?? 'auto';
}

interface FavoriteLoad {
  style: StyleId;
  seed: number;
  palette: ResolvedPalette;
}

const Home: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ favoriteLoad?: FavoriteLoad }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const { isGuest } = useAuth();
  const [palettePref, setPalettePref] = useState<PalettePref>(loadPalette);
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  // Listen for palette changes dispatched by Settings so wallpaper updates immediately
  useEffect(() => {
    const handler = (e: CustomEvent<{ palette: PalettePref }>) => setPalettePref(e.detail.palette);
    window.addEventListener('hazepalette', handler as EventListener);
    return () => window.removeEventListener('hazepalette', handler as EventListener);
  }, []);
  const [favConfirm, setFavConfirm] = useState<string | null>(null);

  const { style, setStyle, seedOffset, activeSeed, seedOverride, regenerate, render, fading, loadFromSeed } =
    useWallpaperGenerator();
  const { state: saveState, handleSave, handleSetWallpaper, showIOSSheet, setShowIOSSheet } = useSaveWallpaper(
    canvasRef as React.RefObject<HTMLCanvasElement>,
  );
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();

  // Load a favorite if navigated here from the Favorites page
  useEffect(() => {
    const fl = location.state?.favoriteLoad;
    if (fl) {
      loadFromSeed(fl.seed, fl.style);
      setPalettePref(fl.palette === 'dark' ? 'dark' : fl.palette === 'light' ? 'light' : 'auto');
      history.replace('/home', {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedPalette = resolvePalette(palettePref);

  // Render whenever style, seed, or palette changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    render(canvas, style, resolvedPalette, seedOffset, seedOverride ?? undefined);
  }, [style, seedOffset, palettePref, render, seedOverride]);

  useSwipeRefresh(canvasWrapperRef as React.RefObject<HTMLElement>, { onRefresh: regenerate });

  const wallpaperId = `${style}-${activeSeed}-${resolvedPalette}`;
  const favorited = isFavorited(wallpaperId);

  const handleFavorite = useCallback(async () => {
    if (isGuest) {
      setShowGuestAlert(true);
      return;
    }
    if (favorited) {
      await removeFavorite(wallpaperId);
      setFavConfirm('Removed from favorites');
    } else {
      const thumb = document.createElement('canvas');
      thumb.width = 300;
      thumb.height = 400;
      GENERATORS[style](thumb, activeSeed, resolvedPalette);
      const thumbnailBase64 = thumb.toDataURL('image/jpeg', 0.75).split(',')[1];
      await addFavorite(wallpaperId, {
        style,
        seed: activeSeed,
        palette: resolvedPalette,
        resolution: '1080x1920',
        thumbnailBase64,
      });
      setFavConfirm('Added to favorites');
    }
    setTimeout(() => setFavConfirm(null), 2200);
  }, [isGuest, favorited, wallpaperId, style, activeSeed, resolvedPalette, addFavorite, removeFavorite]);

  const confirmMessage =
    favConfirm ??
    (saveState.type === 'success'
      ? saveState.message
      : saveState.type === 'error'
        ? saveState.message
        : null);

  return (
    <IonPage className="home-page">
      <TopBar
        onSettingsClick={() => history.push('/settings')}
        onFavoritesClick={() => history.push('/favorites')}
      />
      <StyleToggle value={style} onChange={setStyle} />

      <main className="home-main">
        <div className="canvas-wrapper" ref={canvasWrapperRef}>
          <canvas
            ref={canvasRef}
            className={`wallpaper-canvas${fading ? ' wallpaper-canvas--fading' : ''}`}
          />
        </div>
      </main>

      <div className="action-bar-wrapper">
        <ConfirmationBar message={confirmMessage} />
        <ActionBar
          onGenerate={regenerate}
          onSave={handleSave}
          onSetWallpaper={handleSetWallpaper}
          onFavorite={handleFavorite}
          favorited={favorited}
          saving={saveState.type === 'saving'}
        />
      </div>

      {showIOSSheet && <WallpaperSheet onClose={() => setShowIOSSheet(false)} />}

      <IonAlert
        isOpen={showGuestAlert}
        onDidDismiss={() => setShowGuestAlert(false)}
        header="Save Favorites"
        message="Create a free account to save your favorite wallpapers across devices."
        buttons={[
          { text: 'Maybe Later', role: 'cancel' },
          { text: 'Sign In', handler: () => history.push('/auth') },
        ]}
      />
    </IonPage>
  );
};

export default Home;
