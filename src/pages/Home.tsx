import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IonPage, IonAlert } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getFunctions, httpsCallable } from 'firebase/functions';
import TopBar from '../components/TopBar';
import StyleToggle from '../components/StyleToggle';
import ActionBar from '../components/ActionBar';
import ConfirmationBar from '../components/ConfirmationBar';
import WallpaperSheet from '../components/WallpaperSheet';
import { dateSeed } from '../utils/seededRandom';
import { WALLPAPER_WIDTH, WALLPAPER_HEIGHT } from '../utils/canvasExport';
import { draw as drawGradient } from '../generators/gradient';
import { draw as drawColorblocks } from '../generators/colorblocks';
import { draw as drawDotgrid } from '../generators/dotgrid';
import {
  PalettePref,
  ResolvedPalette,
  StyleId,
  SectionId,
  GENERATORS,
  resolvePalette,
} from '../hooks/useWallpaperGenerator';
import { useSaveWallpaper } from '../hooks/useSaveWallpaper';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { app } from '../firebase/config';
import './Home.css';

const SECTIONS: SectionId[] = ['ai', 'gradient', 'colorblocks', 'dotgrid'];
const PALETTE_KEY = 'haze_palette';

function loadPalette(): PalettePref {
  return (localStorage.getItem(PALETTE_KEY) as PalettePref) ?? 'auto';
}

interface FavoriteLoad {
  style: StyleId;
  seed: number;
  palette: ResolvedPalette;
}

interface AIResult {
  allowed: boolean;
  imageUrl?: string;
  remaining: number;
}

const Home: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ favoriteLoad?: FavoriteLoad }>();
  const { user, isGuest } = useAuth();

  // ── Palette ──────────────────────────────────────────────────────────────
  const [palettePref, setPalettePref] = useState<PalettePref>(loadPalette);
  useEffect(() => {
    const handler = (e: CustomEvent<{ palette: PalettePref }>) => setPalettePref(e.detail.palette);
    window.addEventListener('hazepalette', handler as EventListener);
    return () => window.removeEventListener('hazepalette', handler as EventListener);
  }, []);
  const resolvedPalette = resolvePalette(palettePref);

  // ── Section state ────────────────────────────────────────────────────────
  const [sectionIndex, setSectionIndex] = useState(1); // default to Gradient
  const currentSection = SECTIONS[sectionIndex];

  // ── Per-section seed state ───────────────────────────────────────────────
  const [seedOffsets, setSeedOffsets] = useState<Record<StyleId, number>>({ gradient: 0, colorblocks: 0, dotgrid: 0 });
  const [seedOverrides, setSeedOverrides] = useState<Record<StyleId, number | null>>({ gradient: null, colorblocks: null, dotgrid: null });
  const [fadingSections, setFadingSections] = useState<Record<StyleId, boolean>>({ gradient: false, colorblocks: false, dotgrid: false });

  const gradientSeed = seedOverrides.gradient ?? dateSeed(seedOffsets.gradient);
  const colorblocksSeed = seedOverrides.colorblocks ?? dateSeed(seedOffsets.colorblocks);
  const dotgridSeed = seedOverrides.dotgrid ?? dateSeed(seedOffsets.dotgrid);

  // ── Canvas refs ──────────────────────────────────────────────────────────
  const gradientCanvasRef = useRef<HTMLCanvasElement>(null);
  const colorblocksCanvasRef = useRef<HTMLCanvasElement>(null);
  const dotgridCanvasRef = useRef<HTMLCanvasElement>(null);
  const aiCanvasRef = useRef<HTMLCanvasElement>(null); // hidden – for saving AI image

  // ── AI state ─────────────────────────────────────────────────────────────
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);
  const [aiLimitReached, setAiLimitReached] = useState(false);

  // ── Swiper state ─────────────────────────────────────────────────────────
  const swiperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionIndexRef = useRef(sectionIndex);
  const touchStartRef = useRef({ x: 0, y: 0, t: 0 });
  const directionRef = useRef<'horizontal' | 'vertical' | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);

  // Keep sectionIndexRef in sync so touch handlers can read it without stale closure
  useEffect(() => { sectionIndexRef.current = sectionIndex; }, [sectionIndex]);

  // ── Refresh indicator ────────────────────────────────────────────────────
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
  const thresholdCrossedRef = useRef(false);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [showGuestAlert, setShowGuestAlert] = useState(false);
  const [favConfirm, setFavConfirm] = useState<string | null>(null);

  // ── Canvas rendering ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = gradientCanvasRef.current;
    if (!canvas) return;
    canvas.width = WALLPAPER_WIDTH;
    canvas.height = WALLPAPER_HEIGHT;
    drawGradient(canvas, gradientSeed, resolvedPalette);
  }, [gradientSeed, resolvedPalette]);

  useEffect(() => {
    const canvas = colorblocksCanvasRef.current;
    if (!canvas) return;
    canvas.width = WALLPAPER_WIDTH;
    canvas.height = WALLPAPER_HEIGHT;
    drawColorblocks(canvas, colorblocksSeed, resolvedPalette);
  }, [colorblocksSeed, resolvedPalette]);

  useEffect(() => {
    const canvas = dotgridCanvasRef.current;
    if (!canvas) return;
    canvas.width = WALLPAPER_WIDTH;
    canvas.height = WALLPAPER_HEIGHT;
    drawDotgrid(canvas, dotgridSeed, resolvedPalette);
  }, [dotgridSeed, resolvedPalette]);

  // ── Draw AI image onto hidden canvas when URL is set (for saving) ────────
  // Using useEffect + new Image() instead of img onLoad because data: URLs fire
  // the load event synchronously before React attaches the onLoad handler.
  useEffect(() => {
    if (!aiImageUrl) return;
    const canvas = aiCanvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = WALLPAPER_WIDTH;
      canvas.height = WALLPAPER_HEIGHT;
      canvas.getContext('2d')?.drawImage(img, 0, 0, WALLPAPER_WIDTH, WALLPAPER_HEIGHT);
    };
    img.src = aiImageUrl;
  }, [aiImageUrl]);

  // ── AI generation ─────────────────────────────────────────────────────────
  const triggerAIGeneration = useCallback(async () => {
    if (!user || isGuest || aiLoading || aiLimitReached) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const fns = getFunctions(app);
      const generateFn = httpsCallable<{ palette: string }, AIResult>(fns, 'generateAIWallpaper');
      const result = await generateFn({ palette: resolvedPalette });
      const { allowed, imageUrl, remaining } = result.data;
      if (!allowed) {
        setAiLimitReached(true);
        setAiRemaining(0);
        return;
      }
      if (imageUrl) {
        setAiImageUrl(imageUrl);
        setAiRemaining(remaining);
        if (remaining === 0) setAiLimitReached(true);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('offline')) {
        setAiError('No connection. Connect to generate AI wallpapers.');
      } else {
        setAiError('Generation failed. Try again.');
      }
    } finally {
      setAiLoading(false);
    }
  }, [user, isGuest, aiLoading, aiLimitReached, resolvedPalette]);

  // ── Section regeneration ──────────────────────────────────────────────────
  const regenerateSection = useCallback((section: SectionId) => {
    if (section === 'ai') {
      triggerAIGeneration();
      return;
    }
    const style = section as StyleId;
    setShowRefreshIndicator(true);
    setFadingSections(prev => ({ ...prev, [style]: true }));
    setTimeout(() => {
      setSeedOverrides(prev => ({ ...prev, [style]: null }));
      setSeedOffsets(prev => ({ ...prev, [style]: prev[style] + 1 }));
      setFadingSections(prev => ({ ...prev, [style]: false }));
      setShowRefreshIndicator(false);
    }, 180);
  }, [triggerAIGeneration]);

  // ── Section switching with haptic ─────────────────────────────────────────
  const switchSection = useCallback(async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= SECTIONS.length) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* not available on web */ }
    // Apply transition and snap to new position directly on the DOM element
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      trackRef.current.style.transform = `translateX(-${newIndex * 25}%)`;
    }
    setIsSnapping(true);
    setSectionIndex(newIndex);
    setTimeout(() => setIsSnapping(false), 320);
  }, []);

  // ── Unified touch handler (horizontal swipe + vertical pull-to-refresh) ───
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    directionRef.current = null;
    thresholdCrossedRef.current = false;
    // Disable transition during drag for zero-latency tracking
    if (trackRef.current) trackRef.current.style.transition = 'none';
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;

    if (!directionRef.current) {
      if (Math.abs(dx) > Math.abs(dy) + 8) directionRef.current = 'horizontal';
      else if (Math.abs(dy) > Math.abs(dx) + 8) directionRef.current = 'vertical';
    }

    if (directionRef.current === 'horizontal') {
      // Directly mutate the DOM — no React setState, no re-render during gesture
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(calc(-${sectionIndexRef.current * 25}% + ${dx}px))`;
      }
    } else if (directionRef.current === 'vertical' && dy > 0) {
      if (dy > 70 && !thresholdCrossedRef.current) {
        thresholdCrossedRef.current = true;
        setShowRefreshIndicator(true);
        try { Haptics.impact({ style: ImpactStyle.Medium }); } catch { /* not available on web */ }
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const elapsed = Math.max(Date.now() - touchStartRef.current.t, 1);
    const vx = dx / elapsed;
    const vy = dy / elapsed;
    const viewportW = swiperRef.current?.offsetWidth ?? 375;

    if (directionRef.current === 'horizontal') {
      const threshold = viewportW * 0.28;
      if ((dx < -threshold || vx < -0.3) && sectionIndex < SECTIONS.length - 1) {
        switchSection(sectionIndex + 1);
      } else if ((dx > threshold || vx > 0.3) && sectionIndex > 0) {
        switchSection(sectionIndex - 1);
      } else {
        // snap back without changing section — re-apply transition then restore position
        if (trackRef.current) {
          trackRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          trackRef.current.style.transform = `translateX(-${sectionIndex * 25}%)`;
        }
        setIsSnapping(true);
        setTimeout(() => setIsSnapping(false), 320);
      }
    } else if (directionRef.current === 'vertical') {
      if (dy >= 70 && vy >= 0.4) {
        // regenerateSection handles showRefreshIndicator for generator sections
        // For AI, hide indicator since triggerAIGeneration manages its own loading state
        if (currentSection === 'ai') setShowRefreshIndicator(false);
        regenerateSection(currentSection);
      } else {
        setShowRefreshIndicator(false);
      }
      thresholdCrossedRef.current = false;
    }
  }, [sectionIndex, currentSection, switchSection, regenerateSection]);

  // ── Favorites loading (from Favorites page navigation) ───────────────────
  useEffect(() => {
    const fl = location.state?.favoriteLoad;
    if (fl) {
      const idx = SECTIONS.indexOf(fl.style);
      if (idx !== -1) setSectionIndex(idx);
      setSeedOverrides(prev => ({ ...prev, [fl.style]: fl.seed }));
      setPalettePref(fl.palette === 'dark' ? 'dark' : fl.palette === 'light' ? 'light' : 'auto');
      history.replace('/home', {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save wallpaper (canvas getter for active section) ────────────────────
  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    if (currentSection === 'gradient') return gradientCanvasRef.current;
    if (currentSection === 'colorblocks') return colorblocksCanvasRef.current;
    if (currentSection === 'dotgrid') return dotgridCanvasRef.current;
    return aiCanvasRef.current;
  }, [currentSection]);

  const { state: saveState, handleSave, handleSetWallpaper, showIOSSheet, setShowIOSSheet } =
    useSaveWallpaper(getCanvas);

  // ── Favorites ────────────────────────────────────────────────────────────
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();
  const currentSeed = currentSection === 'gradient' ? gradientSeed : currentSection === 'colorblocks' ? colorblocksSeed : dotgridSeed;
  const wallpaperId = currentSection !== 'ai' ? `${currentSection}-${currentSeed}-${resolvedPalette}` : '';
  const favorited = currentSection !== 'ai' && isFavorited(wallpaperId);

  const handleFavorite = useCallback(async () => {
    if (currentSection === 'ai') return;
    if (isGuest) { setShowGuestAlert(true); return; }
    const style = currentSection as StyleId;
    const seed = currentSeed;
    if (favorited) {
      await removeFavorite(wallpaperId);
      setFavConfirm('Removed from favorites');
    } else {
      const thumb = document.createElement('canvas');
      thumb.width = 300;
      thumb.height = 400;
      GENERATORS[style](thumb, seed, resolvedPalette);
      const thumbnailBase64 = thumb.toDataURL('image/jpeg', 0.75).split(',')[1];
      await addFavorite(wallpaperId, { style, seed, palette: resolvedPalette, resolution: '1080x1920', thumbnailBase64 });
      setFavConfirm('Added to favorites');
    }
    setTimeout(() => setFavConfirm(null), 2200);
  }, [currentSection, isGuest, currentSeed, favorited, wallpaperId, resolvedPalette, addFavorite, removeFavorite]);

  // ── Confirmation message ─────────────────────────────────────────────────
  const confirmMessage =
    favConfirm ??
    (saveState.type === 'success' ? saveState.message : saveState.type === 'error' ? saveState.message : null);

  // ── Generate handler ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    regenerateSection(currentSection);
  }, [currentSection, regenerateSection]);

  const generateDisabled = currentSection === 'ai' && (aiLimitReached || aiLoading);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <IonPage className="home-page">
      <TopBar
        onSettingsClick={() => history.push('/settings')}
        onFavoritesClick={() => history.push('/favorites')}
      />
      <StyleToggle value={currentSection} onChange={(s) => switchSection(SECTIONS.indexOf(s))} />

      <main className="home-main">
        <div
          className="swiper-container"
          ref={swiperRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="swiper-track"
            ref={trackRef}
            style={{
              transform: `translateX(-${sectionIndex * 25}%)`,
            }}
          >
            {/* ── AI Panel ── */}
            <div className="swiper-panel">
              {isGuest ? (
                <div className="ai-prompt">
                  <p className="ai-prompt__text">Sign in to generate AI wallpapers</p>
                  <button className="ai-prompt__btn" onClick={() => history.push('/auth')}>Sign In</button>
                </div>
              ) : (
                <div className="ai-canvas-wrapper">
                  {showRefreshIndicator && currentSection === 'ai' && (
                    <div className="refresh-indicator"><div className="refresh-indicator__spinner" /></div>
                  )}

                  {/* Canvas area — takes all available vertical space */}
                  <div className="ai-canvas-area">
                    {/* Loading shimmer fills canvas area */}
                    {aiLoading && <div className="ai-shimmer" />}

                    {/* Image — fades in */}
                    {!aiLoading && aiImageUrl && (
                      <img src={aiImageUrl} className="ai-image ai-image--fade-in" alt="AI wallpaper" />
                    )}

                    {/* Empty state */}
                    {!aiLoading && !aiImageUrl && !aiError && !aiLimitReached && (
                      <div className="ai-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" />
                        </svg>
                        <p className="ai-placeholder__text">Tap Generate for an AI wallpaper</p>
                        <button className="ai-placeholder__btn" onClick={triggerAIGeneration}>Generate</button>
                      </div>
                    )}

                    {/* Error state */}
                    {!aiLoading && aiError && (
                      <div className="ai-error-box">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <p className="ai-error-box__msg">{aiError}</p>
                        <button className="ai-error-box__retry" onClick={triggerAIGeneration}>Try again</button>
                      </div>
                    )}

                    {/* Limit reached banner */}
                    {aiLimitReached && (
                      <div className="ai-limit-banner">
                        <p className="ai-limit-banner__text">3 daily generations used · Resets tomorrow</p>
                      </div>
                    )}

                    {/* Remaining count */}
                    {!aiLimitReached && aiRemaining !== null && aiRemaining > 0 && (
                      <p className="ai-remaining">{aiRemaining} generation{aiRemaining !== 1 ? 's' : ''} left today</p>
                    )}
                  </div>

                  {/* Loading label — in flow below canvas, only during loading (conditional render, no space when hidden) */}
                  {aiLoading && (
                    <p className="ai-loading-label__text">Generating your wallpaper…</p>
                  )}

                  {/* Disclaimer — always visible, always occupies its space */}
                  <p className="ai-disclaimer">AI generation is in beta and may not always yield perfect results.</p>
                </div>
              )}
            </div>

            {/* ── Gradient Panel ── */}
            <div className="swiper-panel">
              <div className="canvas-wrapper" style={{ position: 'relative' }}>
                {showRefreshIndicator && currentSection === 'gradient' && (
                  <div className="refresh-indicator"><div className="refresh-indicator__spinner" /></div>
                )}
                <canvas
                  ref={gradientCanvasRef}
                  className={`wallpaper-canvas${fadingSections.gradient ? ' wallpaper-canvas--fading' : ''}`}
                />
              </div>
            </div>

            {/* ── Color Blocks Panel ── */}
            <div className="swiper-panel">
              <div className="canvas-wrapper" style={{ position: 'relative' }}>
                {showRefreshIndicator && currentSection === 'colorblocks' && (
                  <div className="refresh-indicator"><div className="refresh-indicator__spinner" /></div>
                )}
                <canvas
                  ref={colorblocksCanvasRef}
                  className={`wallpaper-canvas${fadingSections.colorblocks ? ' wallpaper-canvas--fading' : ''}`}
                />
              </div>
            </div>

            {/* ── Dot Grid Panel ── */}
            <div className="swiper-panel">
              <div className="canvas-wrapper" style={{ position: 'relative' }}>
                {showRefreshIndicator && currentSection === 'dotgrid' && (
                  <div className="refresh-indicator"><div className="refresh-indicator__spinner" /></div>
                )}
                <canvas
                  ref={dotgridCanvasRef}
                  className={`wallpaper-canvas${fadingSections.dotgrid ? ' wallpaper-canvas--fading' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden canvas for AI image saving */}
      <canvas ref={aiCanvasRef} style={{ display: 'none' }} />

      <div className="action-bar-wrapper">
        <ConfirmationBar message={confirmMessage} />
        <ActionBar
          onGenerate={handleGenerate}
          onSave={handleSave}
          onSetWallpaper={handleSetWallpaper}
          onFavorite={currentSection !== 'ai' ? handleFavorite : undefined}
          favorited={favorited}
          saving={saveState.type === 'saving'}
          generateDisabled={generateDisabled}
          saveDisabled={currentSection === 'ai' && (aiLoading || !aiImageUrl)}
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
