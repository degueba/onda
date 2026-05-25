import React from 'react';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link blur} options. */
export const blurSchema = z.object({
  /**
   * Max blur radius in px. Outgoing blurs from 0 to this value as it
   * fades; incoming blurs from this value to 0 as it fades in.
   * Default `10` matches the BlurReveal entrance fingerprint.
   */
  blurAmount: z.number().min(0).max(40).default(10),
});

export type BlurOptions = z.input<typeof blurSchema>;

type BlurProps = { blurAmount: number };

const BlurPresentation: React.FC<TransitionPresentationComponentProps<BlurProps>> = ({
  presentationProgress,
  presentationDirection,
  children,
  passedProps,
}) => {
  const { blurAmount } = passedProps;
  const isEntering = presentationDirection === 'entering';
  const opacity = isEntering ? presentationProgress : 1 - presentationProgress;
  // Outgoing: 0 → blurAmount as it fades.
  // Incoming: blurAmount → 0 as it fades in.
  const blur = isEntering
    ? blurAmount * (1 - presentationProgress)
    : blurAmount * presentationProgress;

  return (
    <AbsoluteFill style={{ opacity, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * Outgoing scene blurs out as it fades; incoming scene blurs in as it
 * fades up. Extends the `BlurReveal` entrance fingerprint across a
 * cut — the missing transition-side of the catalog's most-used reveal.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function blur(
  options?: BlurOptions,
): TransitionPresentation<BlurProps> {
  const opts = blurSchema.parse(options ?? {});
  return {
    component: BlurPresentation,
    props: { blurAmount: opts.blurAmount },
  };
}

export default blur;
