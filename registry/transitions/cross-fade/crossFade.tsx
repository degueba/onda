import { fade, type FadeProps } from '@remotion/transitions/fade';
import type { TransitionPresentation } from '@remotion/transitions';
import { z } from 'zod';

/**
 * Zod schema for {@link crossFade} options.
 *
 * Mirrors the relevant subset of Remotion's `FadeProps`. Onda doesn't
 * expose `enterStyle` / `exitStyle` here — overriding the per-scene CSS
 * defeats the "the cut feels Onda" promise. Users who need that level
 * of override can wrap their own factory.
 */
export const crossFadeSchema = z.object({
  /**
   * Whether the exiting scene fades to transparent during the
   * transition. Default `true` — the eye sees both scenes briefly
   * dissolving into each other.
   *
   * Set `false` for a "fade through" look where the incoming scene
   * simply rises in over the held outgoing one.
   */
  shouldFadeOutExitingScene: z.boolean().default(true),
});

/**
 * Options accepted by {@link crossFade}. Use the `input` type (not
 * `infer`) so defaulted fields are optional at the call site.
 */
export type CrossFadeOptions = z.input<typeof crossFadeSchema>;

/**
 * A calm opacity cross-fade between two scenes. The Onda fingerprint
 * comes from the **recommended timing call** in the README, not from
 * anything in the presentation itself:
 *
 * ```tsx
 * import { Easing } from 'remotion';
 * import { TransitionSeries, linearTiming } from '@remotion/transitions';
 * import { crossFade } from './components/onda/transitions/cross-fade/crossFade';
 *
 * <TransitionSeries.Transition
 *   presentation={crossFade()}
 *   timing={linearTiming({
 *     durationInFrames: 18,
 *     easing: Easing.bezier(0.16, 1, 0.3, 1),
 *   })}
 * />
 * ```
 *
 * Thin wrapper over Remotion's `fade()`. Per techspec 017, the catalog
 * mixes Remotion-wrapped transitions (this one) with Onda-original
 * presentations — the wrapper is intentional even when it's a one-liner,
 * because the named `crossFade` export gives Studio + agents a stable
 * symbol they can dispatch on regardless of Remotion's API evolution.
 */
export function crossFade(
  options?: CrossFadeOptions,
): TransitionPresentation<FadeProps> {
  const opts = crossFadeSchema.parse(options ?? {});
  return fade(opts);
}

export default crossFade;
