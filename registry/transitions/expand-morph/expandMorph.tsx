import React from 'react';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { expandMorphSchema, type ExpandMorphOptions } from './schema';

export { expandMorphSchema, type ExpandMorphOptions };

type ExpandMorphProps = {
  fromX: number;
  fromY: number;
  fromWidth: number;
  fromHeight: number;
  borderRadiusFrom: number;
  borderRadiusTo: number;
  background: string;
};

// House easing — settles with no overshoot.
const HOUSE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

function lerp(from: number, to: number, t: number): number {
  return interpolate(t, [0, 1], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

const ExpandMorphPresentation: React.FC<
  TransitionPresentationComponentProps<ExpandMorphProps>
> = ({ presentationProgress, presentationDirection, children, passedProps }) => {
  const { fromX, fromY, fromWidth, fromHeight, borderRadiusFrom, borderRadiusTo, background } =
    passedProps;
  const isEntering = presentationDirection === 'entering';

  // Single eased timeline drives the whole morph — no springs, no overshoot.
  const t = HOUSE_EASING(presentationProgress);

  // The card grows from the origin rect (fractions of the canvas) to fullscreen.
  // top/left/width/height + radius all interpolate together so it reads as one
  // shared element expanding, not a crop reveal.
  const left = lerp(fromX * 100, 0, t);
  const top = lerp(fromY * 100, 0, t);
  const width = lerp(fromWidth * 100, 100, t);
  const height = lerp(fromHeight * 100, 100, t);
  const radius = lerp(borderRadiusFrom, borderRadiusTo, t);

  if (!isEntering) {
    // Outgoing scene: fades in over the first third, so the moment the card
    // starts growing the source it morphs from is already softening away.
    const opacity = interpolate(t, [0, 1 / 3], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
  }

  // Incoming scene lives inside the morphing card. It fades/settles in over the
  // final third, once the card has enough area to read as the new scene rather
  // than a coloured tile.
  const incomingOpacity = interpolate(t, [2 / 3, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
          borderRadius: `${radius}px`,
          overflow: 'hidden',
          background,
        }}
      >
        <AbsoluteFill style={{ opacity: incomingOpacity }}>{children}</AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

/**
 * A rounded "card" starts at a small origin rect — a region of the outgoing
 * scene — and smoothly expands (top/left/width/height + corner radius all
 * interpolated together) to fill the screen, revealing the incoming scene as
 * it grows. The outgoing scene fades out over the first third; the incoming
 * scene fades/settles in over the final third. Onda's calm take on a morphing
 * modal / image-expand-to-fullscreen reveal — one eased timeline, no overshoot.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 24, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function expandMorph(
  options?: ExpandMorphOptions,
): TransitionPresentation<ExpandMorphProps> {
  const opts = expandMorphSchema.parse(options ?? {});
  return {
    component: ExpandMorphPresentation,
    props: {
      fromX: opts.fromX,
      fromY: opts.fromY,
      fromWidth: opts.fromWidth,
      fromHeight: opts.fromHeight,
      borderRadiusFrom: opts.borderRadiusFrom,
      borderRadiusTo: opts.borderRadiusTo,
      background: opts.background,
    },
  };
}

export default expandMorph;
