// Kinetic typography timing helpers.
//
// Premium kinetic text must hold long enough to be read twice at a
// slow-reader baseline. The formula is conservative on purpose — motion
// graphics serve mixed audiences, not just fast readers, and a viewer who
// missed a line cannot rewind a pre-rendered video. See
// docs/kinetic-typography.md for the full rules.

// ~100 wpm slow-reader floor → 0.6s per word of settled hold.
const SECONDS_PER_WORD = 0.6;

// Even a one-word label needs a beat to land before the next change.
const MIN_HOLD_SECONDS = 1.5;

/**
 * Frames to hold a piece of text after its reveal animation has settled.
 *
 * Formula: `hold_seconds = max(1.5, words * 0.6)`. The 0.6s-per-word floor
 * matches a ~100 wpm slow reader so audiences who can't rewind a pre-rendered
 * video still finish each line.
 *
 * For paragraphs longer than ~20 words, split across multiple cards instead
 * of stretching a single hold.
 *
 * @param words Number of words in the text.
 * @param fps   The composition's frames per second.
 * @returns Frames to hold the text settled before the next change.
 *
 * @example
 * const hold = holdFramesForText(5, 30); // 90 frames @ 30fps (3s)
 */
export const holdFramesForText = (words: number, fps: number): number => {
  const seconds = Math.max(MIN_HOLD_SECONDS, words * SECONDS_PER_WORD);
  return Math.round(seconds * fps);
};

/**
 * Whitespace-separated token count. Empty or whitespace-only strings return 0.
 *
 * @example
 * countWords('motion graphics');     // 2
 * countWords('   ');                 // 0
 */
export const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

/**
 * Derive hold frames directly from a string — shorthand for
 * `holdFramesForText(countWords(text), fps)`.
 *
 * @example
 * const hold = holdFramesForString('motion that moves you', 30); // 72 frames
 */
export const holdFramesForString = (text: string, fps: number): number => {
  return holdFramesForText(countWords(text), fps);
};
