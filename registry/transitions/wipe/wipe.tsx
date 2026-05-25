import { wipe as remotionWipe, type WipeProps as RemotionWipeProps } from '@remotion/transitions/wipe';
import type { TransitionPresentation } from '@remotion/transitions';
import { z } from 'zod';

// Remotion's wipe supports 8 directions including diagonals. Onda caps
// at 4 cardinals — diagonals tend to read as "PowerPoint slide
// transition" rather than deliberate motion. Add the diagonals if a
// concrete use case shows up.
const DIRECTION_MAP = {
  left: 'from-right',
  right: 'from-left',
  up: 'from-bottom',
  down: 'from-top',
} as const;

/** Zod schema for {@link wipe} options. */
export const wipeSchema = z.object({
  /** Which direction the wipe travels across the screen. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type WipeOptions = z.input<typeof wipeSchema>;

/**
 * A hard-edged wipe between two scenes — incoming scene reveals from
 * one edge to the opposite as a moving boundary. Sharper feel than
 * `slide` or `crossFade`; works well when the cut needs to read as a
 * deliberate transition.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Wraps Remotion's `wipe()`.
 */
export function wipe(
  options?: WipeOptions,
): TransitionPresentation<RemotionWipeProps> {
  const opts = wipeSchema.parse(options ?? {});
  return remotionWipe({ direction: DIRECTION_MAP[opts.direction] });
}

export default wipe;
