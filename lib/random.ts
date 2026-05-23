/**
 * Seeded PRNG — the answer to `CLAUDE.md §1`'s "no `Math.random()`" rule.
 *
 * Returns a function that yields the next pseudo-random number in `[0, 1)`.
 * Given the same seed, the sequence is identical forever — safe for
 * deterministic Remotion renders.
 *
 * Use when a component needs apparent randomness (particles, noise, jitter
 * offsets) without breaking determinism.
 *
 * Algorithm: mulberry32. Tiny, fast, statistically fine for visuals.
 *
 * @example
 * const rand = seededRandom(seed);
 * const jitter = rand() * 4 - 2; // -2..+2 px
 */
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
