import { clockWipe as remotionClockWipe, type ClockWipeProps as RemotionClockWipeProps } from '@remotion/transitions/clock-wipe';
import type { TransitionPresentation } from '@remotion/transitions';
import { clockWipeSchema, type ClockWipeOptions } from './schema';

export { clockWipeSchema, type ClockWipeOptions };

/**
 * A clock-hand wipe — the boundary between scenes rotates around the
 * canvas center like a sweeping clock hand. Distinctive and a little
 * cinematic; use sparingly so it stays "deliberate" rather than gimmicky.
 *
 * **Requires `width` + `height`** — pass them from `useVideoConfig()` in
 * the surrounding scene (Remotion's clock-wipe needs explicit dimensions
 * to compute the rotating clip path).
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Wraps Remotion's `clockWipe()`.
 */
export function clockWipe(
  options: ClockWipeOptions,
): TransitionPresentation<RemotionClockWipeProps> {
  const opts = clockWipeSchema.parse(options);
  return remotionClockWipe({ width: opts.width, height: opts.height });
}

export default clockWipe;
