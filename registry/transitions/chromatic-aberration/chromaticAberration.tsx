import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { chromaticAberrationSchema, type ChromaticAberrationOptions } from './schema';

export { chromaticAberrationSchema, type ChromaticAberrationOptions };

type ChromaticAberrationProps = { intensity: number; redColor: string; cyanColor: string };

const ChromaticAberrationPresentation: React.FC<
  TransitionPresentationComponentProps<ChromaticAberrationProps>
> = ({ presentationProgress, presentationDirection, children, passedProps }) => {
  const { intensity, redColor, cyanColor } = passedProps;
  const isEntering = presentationDirection === 'entering';
  const opacity = isEntering ? presentationProgress : 1 - presentationProgress;
  // Outgoing: 0 → intensity as it leaves. Incoming: intensity → 0 as it lands.
  const split = isEntering ? intensity * (1 - presentationProgress) : intensity * presentationProgress;

  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: `drop-shadow(${split}px 0 0 ${redColor}) drop-shadow(${-split}px 0 0 ${cyanColor})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * The cut tears into red/cyan channels and snaps back. Outgoing scene splits
 * wider as it fades; incoming converges from a split as it fades in. The
 * catalog's most aggressive transition — a punctuation move, not a default.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function chromaticAberration(
  options?: ChromaticAberrationOptions,
): TransitionPresentation<ChromaticAberrationProps> {
  const opts = chromaticAberrationSchema.parse(options ?? {});
  return {
    component: ChromaticAberrationPresentation,
    props: { intensity: opts.intensity, redColor: opts.redColor, cyanColor: opts.cyanColor },
  };
}

export default chromaticAberration;
