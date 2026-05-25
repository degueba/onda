import { clockWipe as remotionClockWipe, type ClockWipeProps as RemotionClockWipeProps } from '@remotion/transitions/clock-wipe';
import type { TransitionPresentation } from '@remotion/transitions';
import { z } from 'zod';

/** Zod schema for {@link clockWipe} options. */
export const clockWipeSchema = z.object({
  /** Canvas width in px — typically `useVideoConfig().width`. Required by Remotion's clock wipe. */
  width: z.number().int().positive(),
  /** Canvas height in px — typically `useVideoConfig().height`. */
  height: z.number().int().positive(),
});

export type ClockWipeOptions = z.input<typeof clockWipeSchema>;

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
