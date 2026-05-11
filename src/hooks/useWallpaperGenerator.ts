import { useCallback, useState } from 'react';
import { dateSeed } from '../utils/seededRandom';
import { WALLPAPER_WIDTH, WALLPAPER_HEIGHT } from '../utils/canvasExport';
import { draw as drawGradient } from '../generators/gradient';
import { draw as drawColorblocks } from '../generators/colorblocks';

export type StyleId = 'gradient' | 'colorblocks';
export type PalettePref = 'auto' | 'light' | 'dark';
export type ResolvedPalette = 'dark' | 'light';

export const GENERATORS: Record<StyleId, (canvas: HTMLCanvasElement, seed: number, palette: ResolvedPalette) => void> = {
  gradient: drawGradient,
  colorblocks: drawColorblocks,
};

export function resolvePalette(pref: PalettePref): ResolvedPalette {
  if (pref === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

export function useWallpaperGenerator() {
  const [seedOffset, setSeedOffset] = useState(0);
  const [style, setStyle] = useState<StyleId>('gradient');
  const [fading, setFading] = useState(false);
  // null = use dateSeed(offset); number = loaded from a favorite
  const [seedOverride, setSeedOverride] = useState<number | null>(null);

  const activeSeed = seedOverride !== null ? seedOverride : dateSeed(seedOffset);

  const render = useCallback(
    (canvas: HTMLCanvasElement, s: StyleId, palette: ResolvedPalette, offset: number, override?: number) => {
      canvas.width = WALLPAPER_WIDTH;
      canvas.height = WALLPAPER_HEIGHT;
      const seed = override !== undefined ? override : dateSeed(offset);
      GENERATORS[s](canvas, seed, palette);
    },
    [],
  );

  const regenerate = useCallback(() => {
    setSeedOverride(null);
    setFading(true);
    setTimeout(() => {
      setSeedOffset((o) => o + 1);
      setFading(false);
    }, 180);
  }, []);

  /** Load a specific wallpaper from a favorite by its absolute seed. */
  const loadFromSeed = useCallback((seed: number, s: StyleId) => {
    setSeedOverride(seed);
    setStyle(s);
  }, []);

  return {
    style,
    setStyle,
    seedOffset,
    seedOverride,
    activeSeed,
    regenerate,
    render,
    fading,
    loadFromSeed,
  };
}
