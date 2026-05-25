import React from 'react';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link morph} options. */
export const morphSchema = z.object({
  /**
   * Maximum scale delta around 1.0. Default `0.04` — outgoing scales
   * 1 → 1.04, incoming scales 0.96 → 1. Small by design; the point is
   * to feel cinematic, not loud.
   */
  scaleAmount: z.number().min(0).max(0.2).default(0.04),
});

export type MorphOptions = z.input<typeof morphSchema>;

type MorphProps = { scaleAmount: number };

const MorphPresentation: React.FC<TransitionPresentationComponentProps<MorphProps>> = ({
  presentationProgress,
  presentationDirection,
  children,
  passedProps,
}) => {
  const { scaleAmount } = passedProps;
  const isEntering = presentationDirection === 'entering';
  // Outgoing: opacity 1 → 0, scale 1 → 1+delta (slight zoom away).
  // Incoming: opacity 0 → 1, scale 1-delta → 1 (slight zoom in).
  const opacity = isEntering ? presentationProgress : 1 - presentationProgress;
  const scale = isEntering
    ? 1 - scaleAmount + scaleAmount * presentationProgress
    : 1 + scaleAmount * presentationProgress;

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * Cross-fade plus a subtle synchronized scale — outgoing 1 → 1.04,
 * incoming 0.96 → 1. The scale is small enough to register as polish,
 * not effect. Reads as cinematic where `crossFade` reads as flat.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original. The defining "premium feel" transition in the catalog.
 */
export function morph(
  options?: MorphOptions,
): TransitionPresentation<MorphProps> {
  const opts = morphSchema.parse(options ?? {});
  return {
    component: MorphPresentation,
    props: { scaleAmount: opts.scaleAmount },
  };
}

export default morph;
