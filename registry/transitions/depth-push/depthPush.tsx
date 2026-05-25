import React from 'react';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link depthPush} options. */
export const depthPushSchema = z.object({
  /** Direction the camera move travels. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /**
   * Amount of parallax scale. Outgoing scene scales down by this factor
   * as it pushes off; incoming scales from `1 + scaleAmount` toward 1.
   * Default `0.05` (5%) — subtle by design.
   */
  scaleAmount: z.number().min(0).max(0.3).default(0.05),
});

export type DepthPushOptions = z.input<typeof depthPushSchema>;

type DepthPushProps = { direction: 'left' | 'right' | 'up' | 'down'; scaleAmount: number };

const VECTOR: Record<DepthPushProps['direction'], { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const DepthPushPresentation: React.FC<TransitionPresentationComponentProps<DepthPushProps>> = ({
  presentationProgress,
  presentationDirection,
  children,
  passedProps,
}) => {
  const { x, y } = VECTOR[passedProps.direction];
  const isEntering = presentationDirection === 'entering';
  const s = passedProps.scaleAmount;

  // Same translation as push, layered with a scale that gives depth:
  //   Outgoing: 1.0 → 1.0 - s (recedes slightly as it pushes off)
  //   Incoming: 1.0 + s → 1.0 (approaches from slightly large)
  const translateX = isEntering
    ? -x * 100 * (1 - presentationProgress)
    : x * 100 * presentationProgress;
  const translateY = isEntering
    ? -y * 100 * (1 - presentationProgress)
    : y * 100 * presentationProgress;
  const scale = isEntering
    ? 1 + s * (1 - presentationProgress)
    : 1 - s * presentationProgress;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Push with parallax depth — outgoing scene scales down slightly as it
 * pushes off, incoming scales from slightly larger. The catalog's
 * signature multi-scene move; reads as a camera dolly between scenes.
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original.
 */
export function depthPush(
  options?: DepthPushOptions,
): TransitionPresentation<DepthPushProps> {
  const opts = depthPushSchema.parse(options ?? {});
  return {
    component: DepthPushPresentation,
    props: { direction: opts.direction, scaleAmount: opts.scaleAmount },
  };
}

export default depthPush;
