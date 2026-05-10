import { mulberry32 } from '../utils/seededRandom';

export type Palette = 'dark' | 'light';

type RGB = [number, number, number];

const PALETTE_POOLS: Record<Palette, RGB[]> = {
  dark: [
    [10, 10, 10], [15, 10, 30], [30, 10, 60], [60, 20, 90],
    [10, 30, 50], [0, 50, 80], [80, 20, 40], [20, 20, 80],
    [100, 30, 60], [40, 0, 80], [0, 40, 60], [60, 0, 40],
  ],
  light: [
    [245, 240, 235], [255, 250, 245], [220, 210, 200], [255, 230, 210],
    [200, 220, 240], [240, 200, 220], [200, 240, 220], [255, 245, 220],
    [230, 220, 255], [255, 220, 230], [210, 235, 255], [240, 255, 240],
  ],
};

function rgb(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export function draw(canvas: HTMLCanvasElement, seed: number, palette: Palette): void {
  const ctx = canvas.getContext('2d')!;
  const { width: W, height: H } = canvas;
  const rand = mulberry32(seed);
  const pool = PALETTE_POOLS[palette];

  const jitter = (v: number) => Math.max(0, Math.min(255, v + (rand() - 0.5) * 40));
  const pickColor = (): RGB => {
    const base = pool[Math.floor(rand() * pool.length)];
    return [jitter(base[0]), jitter(base[1]), jitter(base[2])];
  };

  // 3–5 colour stops
  const stopCount = 3 + Math.floor(rand() * 3);
  const stops = Array.from({ length: stopCount }, (_, i) => ({
    pos: i / (stopCount - 1),
    color: pickColor(),
  }));

  // Primary gradient
  const gradChoice = rand();
  let grad: CanvasGradient;

  if (gradChoice < 0.4) {
    const angle = rand() * Math.PI * 2;
    const cx = W / 2, cy = H / 2;
    const len = Math.sqrt(W * W + H * H) / 2;
    grad = ctx.createLinearGradient(
      cx - Math.cos(angle) * len, cy - Math.sin(angle) * len,
      cx + Math.cos(angle) * len, cy + Math.sin(angle) * len,
    );
  } else if (gradChoice < 0.75) {
    const cx = W * (0.2 + rand() * 0.6);
    const cy = H * (0.2 + rand() * 0.6);
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * (0.6 + rand() * 0.5));
  } else {
    const cx = W * (0.3 + rand() * 0.4);
    const cy = H * (0.3 + rand() * 0.4);
    grad = ctx.createConicGradient(rand() * Math.PI * 2, cx, cy);
  }

  stops.forEach(({ pos, color }) => grad.addColorStop(pos, rgb(...color)));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Depth overlay
  const oc = pickColor();
  const overlay = ctx.createRadialGradient(
    W * rand(), H * rand(), 0,
    W * rand(), H * rand(), Math.max(W, H) * (0.4 + rand() * 0.4),
  );
  overlay.addColorStop(0, `rgba(${oc[0]},${oc[1]},${oc[2]},0.3)`);
  overlay.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);
}
