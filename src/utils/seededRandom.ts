// mulberry32 — fast 32-bit seeded PRNG
export function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seed from YYYYMMDD + an offset (for Regenerate) */
export function dateSeed(offset = 0): number {
  const now = new Date();
  const yyyymmdd =
    now.getFullYear() * 10000 +
    (now.getMonth() + 1) * 100 +
    now.getDate();
  return yyyymmdd + offset;
}

/**
 * Compound seed that incorporates date, section, palette choice, and offset.
 * Ensures that different sections and palette modes produce visually distinct
 * wallpapers even when the raw offset seed is the same.
 *
 *   sectionIndex: 0 = AI, 1 = Gradient, 2 = Color Blocks
 *   paletteIndex: 0 = Auto, 1 = Light, 2 = Dark
 *   seedOffset  : the raw value from dateSeed() — used as the variation term
 */
export function compoundSeed(seedOffset: number, sectionIndex: number, paletteIndex: number): number {
  const now = new Date();
  const today =
    now.getFullYear() * 10000 +
    (now.getMonth() + 1) * 100 +
    now.getDate();

  return (
    today * 31 +
    sectionIndex * 1000003 +
    paletteIndex * 999983 +
    seedOffset * 7919
  ) >>> 0;
}

/** Seeded Fisher-Yates shuffle — returns a new array, does not mutate input. */
export function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
