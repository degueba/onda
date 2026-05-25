import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { zoomSchema, type ZoomOptions } from './schema';

export { zoomSchema, type ZoomOptions };

type ZoomProps = { direction: 'in' | 'out'; scaleAmount: number };

const ZoomPresentation: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({
  presentationProgress,
  presentationDirection,
  children,
  passedProps,
}) => {
  const isEntering = presentationDirection === 'entering';
  const { direction, scaleAmount: s } = passedProps;

  // 'in': outgoing scales 1 → 1+s (zooms out of frame),
  //       incoming scales 1-s/2 → 1 (arrives from slightly larger... wait,
  //       per spec: incoming 1.1 → 1 when zoom is 'in').
  //       Actually: 'in' = camera moves toward incoming scene,
  //       so the incoming starts LARGER and settles to 1.0,
  //       outgoing scales LARGER as the "camera" leaves it.
  // 'out': opposite — outgoing shrinks, incoming starts smaller.
  let scale: number;
  if (direction === 'in') {
    scale = isEntering
      ? 1 + s / 2 - (s / 2) * presentationProgress  // 1+s/2 → 1
      : 1 + s * presentationProgress;                // 1 → 1+s
  } else {
    scale = isEntering
      ? 1 - s / 2 + (s / 2) * presentationProgress  // 1-s/2 → 1
      : 1 - s * presentationProgress;                // 1 → 1-s
  }

  const opacity = isEntering ? presentationProgress : 1 - presentationProgress;

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * Scale-driven punch transition. The catalog's lone "accent" register —
 * use sparingly. Two directions:
 *   - `'in'` — incoming scene approaches the viewer (default)
 *   - `'out'` — incoming scene pulls back
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original. The contrast register — when every other cut in the
 * composition uses calm transitions (`crossFade`, `morph`), a single
 * `zoom` reads as a punctuation moment.
 */
export function zoom(
  options?: ZoomOptions,
): TransitionPresentation<ZoomProps> {
  const opts = zoomSchema.parse(options ?? {});
  return {
    component: ZoomPresentation,
    props: { direction: opts.direction, scaleAmount: opts.scaleAmount },
  };
}

export default zoom;
