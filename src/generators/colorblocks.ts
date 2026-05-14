import { mulberry32, compoundSeed, seededShuffle } from '../utils/seededRandom';

export type Palette = 'dark' | 'light' | 'auto';

export interface ColorBlockPalette {
  name: string;
  mood: string;
  mode: 'light' | 'dark' | 'both';
  colors: string[]; // 4–6 curated colours that work together
}

// ---------------------------------------------------------------------------
// Curated color block palettes (22 total — ≥ 20 required)
// Add new entries here — the seed picks one deterministically.
// ---------------------------------------------------------------------------

export const COLORBLOCK_PALETTES: ColorBlockPalette[] = [

  /* Bauhaus — red, blue, cream, navy; pure graphic design */
  { name: 'Bauhaus',      mood: 'graphic',     mode: 'both',  colors: ['#E63946', '#457B9D', '#F1FAEE', '#1D3557'] },

  /* Matisse — teal, sage, gold, warm orange; coastal warmth */
  { name: 'Matisse',      mood: 'coastal',     mode: 'both',  colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'] },

  /* Rothko — deep reds, tan, wheat; moody and contemplative */
  { name: 'Rothko',       mood: 'moody',       mode: 'dark',  colors: ['#8B0000', '#A0522D', '#CD853F', '#F5DEB3'] },

  /* Swiss — stark red, black, white; brutally graphic */
  { name: 'Swiss',        mood: 'stark',       mode: 'both',  colors: ['#FF0000', '#111111', '#F5F5F5', '#DDDDDD'] },

  /* Pastel — pink, peach, yellow, mint, sky; light and airy */
  { name: 'Pastel',       mood: 'airy',        mode: 'light', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'] },

  /* Nordic — deep teal, aqua, powder blue, sage green */
  { name: 'Nordic',       mood: 'cool calm',   mode: 'both',  colors: ['#2E4057', '#048A81', '#54C6EB', '#EEF5DB'] },

  /* Desert — mauve, slate, dusty purple, near-black */
  { name: 'Desert',       mood: 'arid',        mode: 'dark',  colors: ['#C9ADA7', '#9A8C98', '#4A4E69', '#22223B'] },

  /* Forest — dark hunter, forest, sage, pale mint */
  { name: 'Forest',       mood: 'lush',        mode: 'both',  colors: ['#1B4332', '#2D6A4F', '#52B788', '#D8F3DC'] },

  /* Mono Dark — editorial greyscale, dark */
  { name: 'Mono Dark',    mood: 'editorial',   mode: 'dark',  colors: ['#111111', '#2D2D2D', '#555555', '#AAAAAA'] },

  /* Mono Light — editorial greyscale, light */
  { name: 'Mono Light',   mood: 'editorial',   mode: 'light', colors: ['#FFFFFF', '#DDDDDD', '#999999', '#444444'] },

  /* Warm Earth — terracotta, clay, sand, linen */
  { name: 'Warm Earth',   mood: 'terracotta',  mode: 'both',  colors: ['#C1440E', '#D4724A', '#E8A87C', '#F2D3B1'] },

  /* Midnight — near-black, deep navy, oxford blue */
  { name: 'Midnight',     mood: 'cosmic',      mode: 'dark',  colors: ['#0D0D0D', '#1A1A2E', '#16213E', '#0F3460'] },

  /* Sunrise — coral, sun yellow, white foam, dark teal */
  { name: 'Sunrise',      mood: 'warm morning', mode: 'light', colors: ['#FF6B6B', '#FFE66D', '#FFF9F0', '#1A535C'] },

  /* Ocean — abyssal navy, deep ocean, sky blue, ice */
  { name: 'Ocean',        mood: 'oceanic',     mode: 'dark',  colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF'] },

  /* Terracotta — burnt orange, charcoal, warm wheat, sage */
  { name: 'Terracotta',   mood: 'earthy',      mode: 'both',  colors: ['#E07A5F', '#3D405B', '#F2CC8F', '#81B29A'] },

  /* Grape — near-black purple, dark plum, violet, orchid */
  { name: 'Grape',        mood: 'luxe',        mode: 'dark',  colors: ['#1A0033', '#4A0E5E', '#7B2D8B', '#C77DFF'] },

  /* Citrus — burnt orange, bright orange, amber, gold */
  { name: 'Citrus',       mood: 'energetic',   mode: 'light', colors: ['#FF5500', '#FF7F00', '#FFA500', '#FFD000'] },

  /* Steel — dark navy, dark slate, light grey-blue, near-white */
  { name: 'Steel',        mood: 'industrial',  mode: 'dark',  colors: ['#1B2838', '#2A475E', '#66899E', '#C7D5E0'] },

  /* Rose Garden — blush, hot pink, mauve, pale rose */
  { name: 'Rose Garden',  mood: 'romantic',    mode: 'light', colors: ['#FFB6C1', '#FF69B4', '#C9184A', '#FFF0F5'] },

  /* Twilight — near-black navy, dark slate, slate blue, fog */
  { name: 'Twilight',     mood: 'dusk',        mode: 'dark',  colors: ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'] },

  /* Sage & Stone — muted olive, warm stone, parchment, off-black */
  { name: 'Sage & Stone', mood: 'organic',     mode: 'both',  colors: ['#606C38', '#283618', '#FEFAE0', '#DDA15E'] },

  /* Tropical — bright teal, coral, warm white, deep green */
  { name: 'Tropical',     mood: 'vibrant',     mode: 'light', colors: ['#00B4D8', '#FF6B6B', '#FFF9F0', '#005F73'] },

];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ColumnDef { w: number; rows: number[] }

interface Cell {
  x: number; y: number;
  w: number; h: number;
  colIdx: number; rowIdx: number;
}

/**
 * Produce n row-height values that are seeded, never uniform, and sum to 100.
 * Each weight is in the range [0.4, 1.0) so no single row dominates entirely.
 */
function seededRowHeights(n: number, rand: () => number): number[] {
  if (n === 1) return [100];
  const weights = Array.from({ length: n }, () => 0.4 + rand() * 0.6);
  const total = weights.reduce((s, w) => s + w, 0);
  const raw = weights.map(w => (w / total) * 100);
  const floored = raw.map(Math.floor);
  let remainder = 100 - floored.reduce((s, v) => s + v, 0);
  // Distribute rounding remainder to the cells with the largest fractional parts
  const fracs = raw
    .map((v, i) => ({ i, f: v - floored[i] }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < remainder; k++) floored[fracs[k].i]++;
  return floored;
}

function buildCells(template: ColumnDef[], W: number, H: number): Cell[] {
  const totalW = template.reduce((s, c) => s + c.w, 0);
  const cells: Cell[] = [];
  let colX = 0;

  template.forEach((col, colIdx) => {
    const isLastCol = colIdx === template.length - 1;
    const colW = isLastCol ? W - colX : Math.round(W * col.w / totalW);
    const totalRowH = col.rows.reduce((s, r) => s + r, 0);
    let rowY = 0;

    col.rows.forEach((rowH, rowIdx) => {
      const isLastRow = rowIdx === col.rows.length - 1;
      const cellH = isLastRow ? H - rowY : Math.round(H * rowH / totalRowH);
      cells.push({ x: colX, y: rowY, w: colW, h: cellH, colIdx, rowIdx });
      rowY += cellH;
    });

    colX += colW;
  });

  return cells;
}

// Pick a colour from palette, avoiding forbidden colours.
// Falls back to the full palette if all colours are forbidden (e.g. 2-colour palette).
function pickColor(
  palette: string[],
  forbidden: string[],
  rand: () => number,
): string {
  const available = palette.filter(c => !forbidden.includes(c));
  const pool = available.length > 0 ? available : palette;
  return pool[Math.floor(rand() * pool.length)];
}

// ---------------------------------------------------------------------------
// draw
// ---------------------------------------------------------------------------

export function draw(canvas: HTMLCanvasElement, seed: number, palette: Palette): void {
  const ctx = canvas.getContext('2d')!;
  const { width: W, height: H } = canvas;

  // Build compound seed — encodes section (2 = colorblocks) and palette mode
  const paletteIdx = palette === 'light' ? 1 : palette === 'dark' ? 2 : 0;
  const cs = compoundSeed(seed, 2, paletteIdx);
  const rand = mulberry32(cs);

  // ── 1. Pick palette filtered by mode (direct modulo — guaranteed unique per consecutive offset)
  const pool = palette === 'auto'
    ? COLORBLOCK_PALETTES
    : COLORBLOCK_PALETTES.filter(p => p.mode === palette || p.mode === 'both');
  const chosen = pool[cs % pool.length];

  // ── 2. Shuffle color order so same palette looks different each time ───────
  const colors = seededShuffle(chosen.colors, rand);

  // ── 3. Generate layout from seed (never uniform splits) ───────────────────
  // Total blocks: 4–7
  const nBlocks = 4 + Math.floor(rand() * 4);

  // Left column width: 30–70% (non-uniform, seeded)
  const leftW = 30 + Math.floor(rand() * 41);
  const rightW = 100 - leftW;

  // Distribute blocks: left column gets 1–3 rows, right gets the rest
  const maxLeftRows = Math.min(3, nBlocks - 1);
  const leftRowCount = 1 + Math.floor(rand() * maxLeftRows);
  const rightRowCount = nBlocks - leftRowCount;

  const template: ColumnDef[] = [
    { w: leftW,  rows: seededRowHeights(leftRowCount, rand) },
    { w: rightW, rows: seededRowHeights(rightRowCount, rand) },
  ];

  const cells = buildCells(template, W, H);

  // ── 4. Assign colours — no two adjacent cells the same ────────────────────
  // "Adjacent" means: same column consecutive rows, OR overlapping y-range
  // in the column immediately to the left.
  const placed: { cell: Cell; color: string }[] = [];

  cells.forEach(cell => {
    const forbidden: string[] = [];

    // Cell directly above in the same column
    const above = placed.find(
      p => p.cell.colIdx === cell.colIdx && p.cell.rowIdx === cell.rowIdx - 1,
    );
    if (above) forbidden.push(above.color);

    // All cells in the column to the left whose y-range overlaps this cell
    placed
      .filter(
        p =>
          p.cell.colIdx === cell.colIdx - 1 &&
          p.cell.y < cell.y + cell.h &&
          p.cell.y + p.cell.h > cell.y,
      )
      .forEach(p => forbidden.push(p.color));

    const color = pickColor(colors, forbidden, rand);
    placed.push({ cell, color });
  });

  // ── 5. Render — flat colour, no borders ───────────────────────────────────
  placed.forEach(({ cell, color }) => {
    ctx.fillStyle = color;
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
  });
}
