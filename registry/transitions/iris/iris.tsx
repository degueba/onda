import { iris as remotionIris, type IrisProps as RemotionIrisProps } from '@remotion/transitions/iris';
import type { TransitionPresentation } from '@remotion/transitions';
import { z } from 'zod';

/** Zod schema for {@link iris} options. */
export const irisSchema = z.object({
  /** Canvas width in px — typically `useVideoConfig().width`. Required by Remotion's iris. */
  width: z.number().int().positive(),
  /** Canvas height in px — typically `useVideoConfig().height`. */
  height: z.number().int().positive(),
});

export type IrisOptions = z.input<typeof irisSchema>;

/**
 * An iris transition — a circular reveal that grows from / collapses
 * toward the canvas center, like a camera shutter opening. Classic
 * cinematic effect; the catalog's most "deliberate" cut.
 *
 * **Requires `width` + `height`** — pass them from `useVideoConfig()` in
 * the surrounding scene (Remotion's iris needs explicit dimensions to
 * size the radial clip path).
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Wraps Remotion's `iris()`.
 */
export function iris(
  options: IrisOptions,
): TransitionPresentation<RemotionIrisProps> {
  const opts = irisSchema.parse(options);
  return remotionIris({ width: opts.width, height: opts.height });
}

export default iris;
