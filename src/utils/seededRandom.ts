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
