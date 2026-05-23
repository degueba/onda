// Seeded PRNG — the answer to CLAUDE.md §1's "no Math.random()" rule.
// Given the same seed, returns the same sequence forever. Use this when a
// component needs apparent randomness (particles, noise, jitter offsets)
// without breaking determinism.
//
// Algorithm: mulberry32. Tiny, fast, statistically fine for visuals.
export const seededRandom = (seed: number): (() => number) => {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
