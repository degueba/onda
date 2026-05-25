import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { glassWipeSchema, type GlassWipeOptions } from './schema';

export { glassWipeSchema, type GlassWipeOptions };

type GlassWipeProps = { direction: 'left' | 'right' | 'up' | 'down'; frost: number };

function clipFor(direction: GlassWipeProps['direction'], hidden: number): string {
  const pct = `${hidden * 100}%`;
  switch (direction) {
    case 'left':
      return `inset(0 ${pct} 0 0)`;
    case 'right':
      return `inset(0 0 0 ${pct})`;
    case 'up':
      return `inset(0 0 ${pct} 0)`;
    case 'down':
      return `inset(${pct} 0 0 0)`;
  }
}

const GlassWipePresentation: React.FC<
  TransitionPresentationComponentProps<GlassWipeProps>
> = ({ presentationProgress, presentationDirection, children, passedProps }) => {
  const { direction, frost } = passedProps;
  const isEntering = presentationDirection === 'entering';

  if (isEntering) {
    // Wipe in behind a frosted leading edge that sharpens, fading up so the
    // scene below never shows through the revealed area as a hard seam.
    return (
      <AbsoluteFill
        style={{
          opacity: presentationProgress,
          clipPath: clipFor(direction, 1 - presentationProgress),
          filter: `blur(${frost * (1 - presentationProgress)}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  // Outgoing frosts over AND fades out as it's covered — so it doesn't linger
  // as a blurry opaque ghost behind the incoming scene.
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - presentationProgress,
        filter: `blur(${frost * presentationProgress}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * The incoming scene wipes in from a direction behind a frosted-glass edge
 * that sharpens as it settles, while the outgoing scene frosts over beneath
 * it. Reads like a sheet of glass sliding across — calmer than a hard wipe,
 * more textured than a cross-fade.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function glassWipe(
  options?: GlassWipeOptions,
): TransitionPresentation<GlassWipeProps> {
  const opts = glassWipeSchema.parse(options ?? {});
  return {
    component: GlassWipePresentation,
    props: { direction: opts.direction, frost: opts.frost },
  };
}

export default glassWipe;
