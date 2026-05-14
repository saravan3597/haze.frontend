import { compoundSeed } from '../utils/seededRandom';

export type Palette = 'dark' | 'light' | 'auto';

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

interface DotGridPalette {
  name: string;
  mode: 'light' | 'dark';
  background: string;
  dotColor: string;
  accentColor: string;
}

const PALETTES: DotGridPalette[] = [
  // ── Dark ─────────────────────────────────────────────────────────────────
  { name: 'Chalk',     mode: 'dark',  background: '#1a1a1a', dotColor: '#ffffff', accentColor: '#f0ede8' },
  { name: 'Blueprint', mode: 'dark',  background: '#0a1628', dotColor: '#4a90d9', accentColor: '#ffffff' },
  { name: 'Carbon',    mode: 'dark',  background: '#0d0d0d', dotColor: '#2a2a2a', accentColor: '#444444' },
  { name: 'Midnight',  mode: 'dark',  background: '#0a0a1a', dotColor: '#1a1a3e', accentColor: '#3a3a6e' },
  { name: 'Onyx',      mode: 'dark',  background: '#111111', dotColor: '#222222', accentColor: '#555555' },
  { name: 'Dusk',      mode: 'dark',  background: '#1a0a2e', dotColor: '#3a1a5e', accentColor: '#7a4aae' },
  { name: 'Forest',    mode: 'dark',  background: '#0a1a0a', dotColor: '#1a3a1a', accentColor: '#4a8a4a' },
  { name: 'Rose',      mode: 'dark',  background: '#1a0a0a', dotColor: '#3a1a1a', accentColor: '#8a4a4a' },
  { name: 'Ember',     mode: 'dark',  background: '#1a0800', dotColor: '#3a1800', accentColor: '#c04a00' },
  { name: 'Void',      mode: 'dark',  background: '#000000', dotColor: '#0a0a0a', accentColor: '#1a1a1a' },
  // ── Light ────────────────────────────────────────────────────────────────
  { name: 'Graph',     mode: 'light', background: '#f5f5f0', dotColor: '#cccccc', accentColor: '#111111' },
  { name: 'Blush',     mode: 'light', background: '#fdf0f0', dotColor: '#e8b4b8', accentColor: '#c47a7a' },
  { name: 'Cream',     mode: 'light', background: '#faf8f3', dotColor: '#e0d9cc', accentColor: '#b5a99a' },
  { name: 'Sage',      mode: 'light', background: '#f0f4f0', dotColor: '#a8c5a0', accentColor: '#4a7a4a' },
  { name: 'Arctic',    mode: 'light', background: '#e8f4fd', dotColor: '#b0d4ee', accentColor: '#4a90c4' },
  { name: 'Sand',      mode: 'light', background: '#f5f0e8', dotColor: '#d4c8b0', accentColor: '#8a7a60' },
  { name: 'Ice',       mode: 'light', background: '#f0f8ff', dotColor: '#c8e4f8', accentColor: '#4a90d9' },
  { name: 'Mist',      mode: 'light', background: '#f0f0f4', dotColor: '#c8c8d8', accentColor: '#6868a0' },
  { name: 'Paper',     mode: 'light', background: '#ffffff', dotColor: '#e8e8e8', accentColor: '#999999' },
  { name: 'Slate',     mode: 'light', background: '#f2f4f6', dotColor: '#c0c8d0', accentColor: '#6a7a8a' },
];

// ---------------------------------------------------------------------------
// draw
// ---------------------------------------------------------------------------

export function draw(canvas: HTMLCanvasElement, seed: number, palette: Palette): void {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  // Build compound seed (sectionIndex 3 = Dot Grid)
  const paletteIdx = palette === 'light' ? 1 : palette === 'dark' ? 2 : 0;
  const cs = compoundSeed(seed, 3, paletteIdx);

  // ── 1. Pick palette ────────────────────────────────────────────────────────
  const pool = palette === 'auto' ? PALETTES : PALETTES.filter(p => p.mode === palette);
  const chosen = pool[cs % pool.length];

  // Fill background
  ctx.fillStyle = chosen.background;
  ctx.fillRect(0, 0, W, H);

  // ── 2. Grid parameters (all derived from cs, scaled to canvas width) ───────
  // Spec values are at 1080px width — scale proportionally
  const scale = W / 1080;

  const spacingBase = (28 + (cs % 25)) * scale;
  const radius      = (1.5 + ((cs * 7) % 25) / 10) * scale;
  const opacity     = 0.3 + ((cs * 13) % 60) / 100;

  const offsetX = (cs % Math.max(1, Math.round(spacingBase))) ;
  const offsetY = ((cs * 3) % Math.max(1, Math.round(spacingBase)));

  const accentEvery = 5 + (cs % 8);
  const accentRadius  = radius * 1.8;
  const accentOpacity = Math.min(1.0, opacity * 1.2);

  // ── 3. Variation mode ─────────────────────────────────────────────────────
  const mode = cs % 4; // 0=Uniform, 1=Pulse, 2=Fade, 3=Scatter
  const fadeReverse = (cs % 2) === 1;

  const cx = W / 2;
  const cy = H / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  // ── 4. Draw dots ──────────────────────────────────────────────────────────
  let dotIndex = 0;

  for (let y = -spacingBase + offsetY; y < H + spacingBase; y += spacingBase) {
    for (let x = -spacingBase + offsetX; x < W + spacingBase; x += spacingBase) {
      dotIndex++;

      // Scatter mode: offset dot position slightly
      let drawX = x;
      let drawY = y;
      if (mode === 3) {
        const scatterRange = cs % 4;
        // Deterministic per-dot offset using dot index
        const sx = ((cs + dotIndex * 1013) % (scatterRange * 2 + 1)) - scatterRange;
        const sy = ((cs + dotIndex * 1019) % (scatterRange * 2 + 1)) - scatterRange;
        drawX = x + sx * scale;
        drawY = y + sy * scale;
      }

      const isAccent = (dotIndex % accentEvery) === 0;

      // Determine radius for this dot
      let r = isAccent ? accentRadius : radius;
      let op = isAccent ? accentOpacity : opacity;

      if (mode === 1 && !isAccent) {
        // Pulse: larger near center
        const dist = Math.sqrt((drawX - cx) ** 2 + (drawY - cy) ** 2);
        const sizeMult = 1.0 - (dist / maxDist) * 0.5;
        r = radius * Math.max(0.3, sizeMult);
      }

      if (mode === 2) {
        // Fade: opacity varies top-to-bottom (or bottom-to-top)
        const t = fadeReverse ? 1 - (drawY / H) : (drawY / H);
        op = Math.max(0, (isAccent ? accentOpacity : opacity) * (1 - t * 0.7));
      }

      const color = isAccent ? chosen.accentColor : chosen.dotColor;
      ctx.globalAlpha = Math.min(1, Math.max(0, op));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(drawX, drawY, Math.max(0.5, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}
