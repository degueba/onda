import { flip as remotionFlip, type FlipProps as RemotionFlipProps } from '@remotion/transitions/flip';
import type { TransitionPresentation } from '@remotion/transitions';
import { flipSchema, type FlipOptions } from './schema';

export { flipSchema, type FlipOptions };

const DIRECTION_MAP = {
  left: 'from-right',
  right: 'from-left',
  up: 'from-bottom',
  down: 'from-top',
} as const;

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
