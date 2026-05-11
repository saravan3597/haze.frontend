import { mulberry32 } from '../utils/seededRandom';

export type Palette = 'dark' | 'light';

export interface ColorBlockPalette {
  name: string;
  mood: string;
  mode: 'light' | 'dark' | 'both';
  colors: string[]; // 4–6 curated colours that work together
}

// ---------------------------------------------------------------------------
// Curated color block palettes
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
// Layout templates — Mondrian-style column × row splits
//
// Each entry is an array of column definitions. `w` and each value in
// `rows` are arbitrary relative units that are normalised at draw time.
// At least one cell in every template covers ≥ 30% of the canvas area.
// ---------------------------------------------------------------------------

interface ColumnDef { w: number; rows: number[] }

const LAYOUT_TEMPLATES: ColumnDef[][] = [

  // 5 cells — dominant top-left, right col with 3 rows
  [
    { w: 60, rows: [55, 45] },     // largest: 60% × 55% ≈ 33%
    { w: 40, rows: [35, 30, 35] },
  ],

  // 4 cells — tall narrow left strip + 3 rows on right
  [
    { w: 38, rows: [100] },        // largest: 38% × 100% = 38%
    { w: 62, rows: [45, 32, 23] },
  ],

  // 5 cells — left 3 rows, right 2 rows with tall top cell
  [
    { w: 45, rows: [40, 35, 25] },
    { w: 55, rows: [62, 38] },     // largest: 55% × 62% ≈ 34%
  ],

  // 4 cells — slim left strip, dominant right
  [
    { w: 32, rows: [100] },
    { w: 68, rows: [55, 45] },     // largest: 68% × 55% ≈ 37%
  ],

  // 4 cells — 2 left rows + tall full-height right strip
  [
    { w: 65, rows: [60, 40] },     // largest: 65% × 60% = 39%
    { w: 35, rows: [100] },
  ],

  // 4 cells — dominant left takes full height, right split 2
  [
    { w: 55, rows: [100] },        // dominant: 55% of canvas area
    { w: 45, rows: [55, 45] },
  ],

  // 5 cells — wide left 3 rows, very slim right strip
  [
    { w: 55, rows: [55, 25, 20] }, // largest: 55% × 55% ≈ 30%
    { w: 45, rows: [55, 45] },
  ],

  // 5 cells — extremely wide dominant left + narrow right 3 rows
  [
    { w: 62, rows: [100] },        // dominant: 62% of canvas
    { w: 38, rows: [40, 35, 25] },
  ],

  // 4 cells — equal halves, one side full-height
  [
    { w: 50, rows: [100] },        // dominant: 50% of canvas
    { w: 50, rows: [52, 48] },
  ],

  // 5 cells — asymmetric, left 2 tall rows + right 3 smaller rows
  [
    { w: 58, rows: [48, 52] },     // largest: 58% × 52% ≈ 30%
    { w: 42, rows: [32, 38, 30] },
  ],

];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Cell {
  x: number; y: number;
  w: number; h: number;
  colIdx: number; rowIdx: number;
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
  const rand = mulberry32(seed);

  // ── 1. Pick palette filtered by mode ──────────────────────────────────────
  const pool = COLORBLOCK_PALETTES.filter(p => p.mode === palette || p.mode === 'both');
  const chosen = pool[Math.floor(rand() * pool.length)];

  // ── 2. Pick layout ─────────────────────────────────────────────────────────
  const template = LAYOUT_TEMPLATES[Math.floor(rand() * LAYOUT_TEMPLATES.length)];
  const cells = buildCells(template, W, H);

  // ── 3. Assign colours — no two adjacent cells the same ────────────────────
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

    const color = pickColor(chosen.colors, forbidden, rand);
    placed.push({ cell, color });
  });

  // ── 4. Render — flat colour, no borders ───────────────────────────────────
  placed.forEach(({ cell, color }) => {
    ctx.fillStyle = color;
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
  });
}
