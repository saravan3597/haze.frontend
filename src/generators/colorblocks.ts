import { mulberry32 } from '../utils/seededRandom';

export type Palette = 'dark' | 'light';

const PALETTE_POOLS: Record<Palette, string[]> = {
  dark: [
    '#0a0a0a', '#1a1a1a', '#f0ede8', '#c9b99a', '#1e3a5f',
    '#4a1942', '#1a3a2a', '#3d1515', '#2b1d0e', '#0d2b3e',
    '#3b0a0a', '#0a3b2e',
  ],
  light: [
    '#f5f0eb', '#ede0d0', '#dbd0c0', '#faf5f0', '#c8b8a0',
    '#b8d4e8', '#e8c8d8', '#c8e8d0', '#f0d8b8', '#e0d8f0',
    '#f8e8d0', '#d8e8f8',
  ],
};

interface Cell { x: number; y: number; w: number; h: number }

function partition(
  rand: () => number, x: number, y: number, w: number, h: number, depth: number,
): Cell[] {
  const minSize = Math.min(w, h) * 0.12;
  if (depth === 0 || w < minSize || h < minSize) return [{ x, y, w, h }];

  const splitV = rand() > 0.5;
  const ratio = 0.25 + rand() * 0.5;

  if (splitV) {
    const sx = Math.round(x + w * ratio);
    return [
      ...partition(rand, x, y, sx - x, h, depth - 1),
      ...partition(rand, sx, y, x + w - sx, h, depth - 1),
    ];
  } else {
    const sy = Math.round(y + h * ratio);
    return [
      ...partition(rand, x, y, w, sy - y, depth - 1),
      ...partition(rand, x, sy, w, y + h - sy, depth - 1),
    ];
  }
}

export function draw(canvas: HTMLCanvasElement, seed: number, palette: Palette): void {
  const ctx = canvas.getContext('2d')!;
  const { width: W, height: H } = canvas;
  const rand = mulberry32(seed);
  const colors = PALETTE_POOLS[palette];

  // Background
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, W, H);

  const depth = 3 + Math.floor(rand() * 3);
  const cells = partition(rand, 0, 0, W, H, depth);

  cells.forEach((cell) => {
    if (rand() < 0.12) return; // leave some as background
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
  });

  // Grid lines — very subtle
  const lineColor = palette === 'light' ? '#000000' : '#ffffff';
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = Math.max(1, W * 0.003);
  ctx.globalAlpha = 0.12;
  cells.forEach((cell) => ctx.strokeRect(cell.x, cell.y, cell.w, cell.h));
  ctx.globalAlpha = 1;
}
