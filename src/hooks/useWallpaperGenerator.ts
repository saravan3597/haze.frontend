import { useCallback, useState } from 'react';
import { dateSeed } from '../utils/seededRandom';
import { WALLPAPER_WIDTH, WALLPAPER_HEIGHT } from '../utils/canvasExport';
import { draw as drawGradient } from '../generators/gradient';
import { draw as drawColorblocks } from '../generators/colorblocks';

export type StyleId = 'gradient' | 'colorblocks';
export type PalettePref = 'auto' | 'light' | 'dark';
export type ResolvedPalette = 'dark' | 'light';
// mode: 'pattern' | 'ai'  — TODO: AI mode (future phase)

const GENERATORS: Record<StyleId, (canvas: HTMLCanvasElement, seed: number, palette: ResolvedPalette) => void> = {
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

  const render = useCallback(
    (canvas: HTMLCanvasElement, s: StyleId, palette: ResolvedPalette, offset: number) => {
      canvas.width = WALLPAPER_WIDTH;
      canvas.height = WALLPAPER_HEIGHT;
      GENERATORS[s](canvas, dateSeed(offset), palette);
    },
    [],
  );

  const regenerate = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setSeedOffset((o) => o + 1);
      setFading(false);
    }, 180);
  }, []);

  return {
    style,
    setStyle,
    seedOffset,
    regenerate,
    render,
    fading,
  };
}
