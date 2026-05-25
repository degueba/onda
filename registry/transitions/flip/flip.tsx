import { flip as remotionFlip, type FlipProps as RemotionFlipProps } from '@remotion/transitions/flip';
import type { TransitionPresentation } from '@remotion/transitions';
import { z } from 'zod';

const DIRECTION_MAP = {
  left: 'from-right',
  right: 'from-left',
  up: 'from-bottom',
  down: 'from-top',
} as const;

/** Zod schema for {@link flip} options. */
export const flipSchema = z.object({
  /** Which way the flip rotates. `'left'` flips the scene around like a card revealing the new face from the right edge. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /**
   * Perspective in pixels — distance of the implicit "camera" from the
   * flipping plane. Lower = more dramatic 3D, higher = subtler.
   * Default `1000` matches Remotion's default.
   */
  perspective: z.number().positive().default(1000),
});

export type FlipOptions = z.input<typeof flipSchema>;

/**
 * A 3D card-flip between two scenes — outgoing scene rotates away,
 * incoming scene rotates into view. The most dramatic of the wrapped
 * Remotion transitions; use when a beat genuinely warrants a "now we're
 * looking at something new" punch.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Wraps Remotion's `flip()`.
 */
export function flip(
  options?: FlipOptions,
): TransitionPresentation<RemotionFlipProps> {
  const opts = flipSchema.parse(options ?? {});
  return remotionFlip({
    direction: DIRECTION_MAP[opts.direction],
    perspective: opts.perspective,
  });
}

export default flip;
