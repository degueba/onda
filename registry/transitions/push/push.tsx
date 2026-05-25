import React from 'react';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link push} options. */
export const pushSchema = z.object({
  /**
   * Which direction the entire frame translates. Both scenes move
   * together as a unit — reads as a camera pan between them.
   */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type PushOptions = z.input<typeof pushSchema>;

type PushProps = { direction: 'left' | 'right' | 'up' | 'down' };

// Map direction → translation vector for the OUTGOING scene. The
// incoming scene starts at the opposite edge and moves with the same
// vector toward (0,0). This gives the camera-pan feel where both
// scenes appear to slide together.
const VECTOR: Record<PushProps['direction'], { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const PushPresentation: React.FC<TransitionPresentationComponentProps<PushProps>> = ({
  presentationProgress,
  presentationDirection,
  children,
  passedProps,
}) => {
  const { x, y } = VECTOR[passedProps.direction];
  const isEntering = presentationDirection === 'entering';
  // Outgoing scene: translates from (0,0) toward the vector × 100%.
  // Incoming scene: starts at the OPPOSITE vector × 100% and lands at (0,0).
  // Both move with the same vector, so the perceived motion is unified.
  const translateX = isEntering
    ? -x * 100 * (1 - presentationProgress)
    : x * 100 * presentationProgress;
  const translateY = isEntering
    ? -y * 100 * (1 - presentationProgress)
    : y * 100 * presentationProgress;

  return (
    <AbsoluteFill style={{ transform: `translate(${translateX}%, ${translateY}%)` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * A directional push between two scenes — both scenes translate
 * together in the same direction, like a camera pan. Different from
 * `slide` (which only moves the incoming scene) and `depthPush`
 * (which adds parallax scale).
 *
 * Pair with the recommended Onda timing for the house feel:
 * `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`
 *
 * Onda-original — no Remotion equivalent.
 */
export function push(
  options?: PushOptions,
): TransitionPresentation<PushProps> {
  const opts = pushSchema.parse(options ?? {});
  return {
    component: PushPresentation,
    props: { direction: opts.direction },
  };
}

export default push;
