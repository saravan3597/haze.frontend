import { mulberry32, compoundSeed } from "../utils/seededRandom";

export type Palette = "dark" | "light" | "auto";

export interface GradientPalette {
  name: string;
  mood: string;
  mode: "light" | "dark" | "both";
  stops: string[]; // 2–3 hex colours, ordered start → end
}

// ---------------------------------------------------------------------------
// Curated gradient palettes (30 total — ≥ 25 required)
// Add new entries here — the seed picks one deterministically.
// ---------------------------------------------------------------------------

export const GRADIENT_PALETTES: GradientPalette[] = [
  // ── Light ────────────────────────────────────────────────────────────────

  /* Arctic — cool, icy, crystalline */
  {
    name: "Arctic",
    mood: "icy",
    mode: "light",
    stops: ["#C8E6FF", "#E8F4FD", "#FFFFFF"],
  },

  /* Ember — warm amber fading to soft gold */
  {
    name: "Ember",
    mood: "warm amber",
    mode: "light",
    stops: ["#F7971E", "#FFD200"],
  },

  /* Rose Quartz — soft peach to ice blue, delicate */
  {
    name: "Rose Quartz",
    mood: "delicate",
    mode: "light",
    stops: ["#FDDB92", "#D1FDFF"],
  },

  /* Sage — botanical mint to steel blue */
  {
    name: "Sage",
    mood: "botanical",
    mode: "light",
    stops: ["#B7F8DB", "#50A7C2"],
  },

  /* Nordic — soft teal to blush, Scandinavian calm */
  {
    name: "Nordic",
    mood: "Scandinavian",
    mode: "light",
    stops: ["#A8EDEA", "#FED6E3"],
  },

  /* Sand — warm desert neutrals */
  {
    name: "Sand",
    mood: "desert",
    mode: "light",
    stops: ["#F5EFE6", "#D4B896"],
  },

  /* Blossom — peach to rose, springtime */
  {
    name: "Blossom",
    mood: "springtime",
    mode: "light",
    stops: ["#FFCBA4", "#FF9A9E"],
  },

  /* Lavender Haze — lavender merging into sky blue */
  {
    name: "Lavender Haze",
    mood: "dreamy",
    mode: "light",
    stops: ["#E0C3FC", "#8EC5FC"],
  },

  /* Spring — lime to lemon yellow, fresh morning */
  {
    name: "Spring",
    mood: "fresh",
    mode: "light",
    stops: ["#96FBC4", "#F9F586"],
  },

  /* Cloud — silver to near-white, minimal */
  {
    name: "Cloud",
    mood: "minimal",
    mode: "light",
    stops: ["#DFDBE5", "#F5F7FA"],
  },

  /* Peach — tropical warm gradient */
  {
    name: "Peach",
    mood: "tropical",
    mode: "light",
    stops: ["#FFB347", "#FFCC70", "#FFF5E4"],
  },

  /* Periwinkle — soft blue lavender, calm */
  {
    name: "Periwinkle",
    mood: "calm",
    mode: "light",
    stops: ["#A0C4FF", "#C3CFE2", "#F5F7FA"],
  },

  /* Cotton Candy — pink to sky, playful */
  {
    name: "Cotton Candy",
    mood: "playful",
    mode: "light",
    stops: ["#FBC2EB", "#A6C1EE"],
  },

  /* Honey — warm golden amber */
  {
    name: "Honey",
    mood: "golden",
    mode: "light",
    stops: ["#FFECD2", "#FCB69F"],
  },

  // ── Dark ─────────────────────────────────────────────────────────────────

  /* Midnight — deep rich purples, contemplative */
  {
    name: "Midnight",
    mood: "contemplative",
    mode: "dark",
    stops: ["#0F0C29", "#302B63", "#24243E"],
  },

  /* Dusk — purple to teal to mint, liminal */
  {
    name: "Dusk",
    mood: "liminal",
    mode: "dark",
    stops: ["#2D1B69", "#11998E", "#38EF7D"],
  },

  /* Aurora — electric blue to lime, northern lights */
  {
    name: "Aurora",
    mood: "northern lights",
    mode: "dark",
    stops: ["#00C9FF", "#92FE9D"],
  },

  /* Obsidian — very dark, dramatic crimson core */
  {
    name: "Obsidian",
    mood: "dramatic",
    mode: "dark",
    stops: ["#200122", "#6F0000"],
  },

  /* Charcoal — sophisticated dark greys */
  {
    name: "Charcoal",
    mood: "sophisticated",
    mode: "dark",
    stops: ["#485563", "#29323C"],
  },

  /* Neon Pulse — electric tricolor, cyberpunk */
  {
    name: "Neon Pulse",
    mood: "cyberpunk",
    mode: "dark",
    stops: ["#12C2E9", "#C471ED", "#F64F59"],
  },

  /* Deep Ocean — rich blue to teal, submerged */
  {
    name: "Deep Ocean",
    mood: "submerged",
    mode: "dark",
    stops: ["#1A2980", "#26D0CE"],
  },

  /* Void — near-black deep blues, cosmic */
  {
    name: "Void",
    mood: "cosmic",
    mode: "dark",
    stops: ["#0D0D0D", "#1A1A2E", "#16213E"],
  },

  /* Galaxy — deep purple to teal, interstellar */
  {
    name: "Galaxy",
    mood: "interstellar",
    mode: "dark",
    stops: ["#360033", "#0B8793"],
  },

  /* Cyber — navy to violet to crimson, digital noir */
  {
    name: "Cyber",
    mood: "digital noir",
    mode: "dark",
    stops: ["#0F3460", "#533483", "#E94560"],
  },

  /* Emerald Night — rich dark teal, lush and moody */
  {
    name: "Emerald Night",
    mood: "lush",
    mode: "dark",
    stops: ["#093028", "#237A57"],
  },

  /* Slate — cool layered dark blues, industrial */
  {
    name: "Slate",
    mood: "industrial",
    mode: "dark",
    stops: ["#0F2027", "#203A43", "#2C5364"],
  },

  /* Crimson — deep red to burnt orange, fiery */
  {
    name: "Crimson",
    mood: "fiery",
    mode: "dark",
    stops: ["#4B0000", "#8B0000", "#CC3300"],
  },

  /* Abyss — near black to deep indigo */
  {
    name: "Abyss",
    mood: "deep",
    mode: "dark",
    stops: ["#000000", "#0A0A23", "#1A0050"],
  },

  // ── Both modes ───────────────────────────────────────────────────────────

  /* Sunset — coral to gold, golden hour */
  {
    name: "Sunset",
    mood: "golden hour",
    mode: "both",
    stops: ["#FF6B6B", "#FEE140"],
  },

  /* Spectrum — purple to red to yellow, prismatic */
  {
    name: "Spectrum",
    mood: "prismatic",
    mode: "both",
    stops: ["#6B48FF", "#FF6B6B", "#FFD93D"],
  },
];

// ---------------------------------------------------------------------------
// draw
// ---------------------------------------------------------------------------

export function draw(
  canvas: HTMLCanvasElement,
  seed: number,
  palette: Palette,
): void {
  const ctx = canvas.getContext("2d")!;
  const { width: W, height: H } = canvas;

  // Build compound seed — encodes section (1 = gradient) and palette mode
  const paletteIdx = palette === "light" ? 1 : palette === "dark" ? 2 : 0;
  const cs = compoundSeed(seed, 1, paletteIdx);
  const rand = mulberry32(cs);

  // ── 1. Pick palette filtered by mode (direct modulo — guaranteed unique per consecutive offset)
  const pool =
    palette === "auto"
      ? GRADIENT_PALETTES
      : GRADIENT_PALETTES.filter(
          (p) => p.mode === palette || p.mode === "both",
        );
  const chosen = pool[cs % pool.length];

  // ── 2. Angle: full 0–359° derived from compound seed ──────────────────────
  const angleDeg = (Math.imul(cs, 1103515245) >>> 0) % 360;
  const angle = (angleDeg * Math.PI) / 180;

  // ── 3. Gradient type: 0,1 = linear, 2 = radial (≈33% radial) ─────────────
  const isRadial = cs % 3 === 2;

  // ── 4. Build gradient ─────────────────────────────────────────────────────
  let grad: CanvasGradient;

  if (isRadial) {
    // Focal point seeded off-centre for a natural feel
    const cx = W * (0.25 + rand() * 0.5);
    const cy = H * (0.15 + rand() * 0.35);
    const radius = Math.sqrt(W * W + H * H) * 0.65;
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  } else {
    const cx = W / 2;
    const cy = H / 2;
    const len = Math.sqrt(W * W + H * H) / 2;
    grad = ctx.createLinearGradient(
      cx - Math.cos(angle) * len,
      cy - Math.sin(angle) * len,
      cx + Math.cos(angle) * len,
      cy + Math.sin(angle) * len,
    );
  }

  // ── 5. Color stops with ± 10% variation on intermediate positions ──────────
  const { stops } = chosen;
  stops.forEach((color, i) => {
    let pos = i / Math.max(stops.length - 1, 1);
    if (i > 0 && i < stops.length - 1) {
      // Vary the middle stop position within ± 10% of its default position
      pos = Math.max(0.05, Math.min(0.95, pos + (rand() * 2 - 1) * 0.1));
    }
    grad.addColorStop(pos, color);
  });

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── 6. Subtle vignette for depth ──────────────────────────────────────────
  const vigCx = W / 2;
  const vigCy = H * 0.42;
  const vigR = Math.sqrt(W * W + H * H) * 0.58;
  const vig = ctx.createRadialGradient(vigCx, vigCy, 0, vigCx, vigCy, vigR);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(
    1,
    palette === "light" ? "rgba(0,0,0,0.09)" : "rgba(0,0,0,0.28)",
  );
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}
