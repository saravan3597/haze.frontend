import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonPage } from '@ionic/react';
import TopBar from '../components/TopBar';
import StyleToggle from '../components/StyleToggle';
import ActionBar from '../components/ActionBar';
import ConfirmationBar from '../components/ConfirmationBar';
import SettingsSheet from '../components/SettingsSheet';
import { useWallpaperGenerator, PalettePref, resolvePalette } from '../hooks/useWallpaperGenerator';
import { useSwipeRefresh } from '../hooks/useSwipeRefresh';
import { useSaveWallpaper } from '../hooks/useSaveWallpaper';
import './Home.css';

const PALETTE_KEY = 'haze_palette';

function loadPalette(): PalettePref {
  return (localStorage.getItem(PALETTE_KEY) as PalettePref) ?? 'auto';
}

const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [palettePref, setPalettePref] = useState<PalettePref>(loadPalette);

  const { style, setStyle, seedOffset, regenerate, render, fading } = useWallpaperGenerator();
  const { state: saveState, handleSave, handleSetWallpaper } = useSaveWallpaper(canvasRef as React.RefObject<HTMLCanvasElement>);

  // Persist palette preference
  const handlePaletteChange = useCallback((p: PalettePref) => {
    setPalettePref(p);
    localStorage.setItem(PALETTE_KEY, p);
  }, []);

  // Render wallpaper whenever style, seed or palette changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    render(canvas, style, resolvePalette(palettePref), seedOffset);
  }, [style, seedOffset, palettePref, render]);

  // Hard swipe → regenerate + haptics
  useSwipeRefresh(canvasWrapperRef as React.RefObject<HTMLElement>, { onRefresh: regenerate });

  // Derive confirmation message from save state
  const confirmMessage =
    saveState.type === 'success' ? saveState.message
    : saveState.type === 'error' ? saveState.message
    : null;

  return (
    <IonPage className="home-page">
      <TopBar onSettingsClick={() => setSettingsOpen(true)} />
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
          onSave={handleSave}
          onSetWallpaper={handleSetWallpaper}
          saving={saveState.type === 'saving'}
        />
      </div>

      <SettingsSheet
        isOpen={settingsOpen}
        onDismiss={() => setSettingsOpen(false)}
        palette={palettePref}
        onPaletteChange={handlePaletteChange}
      />
    </IonPage>
  );
};

export default Home;
