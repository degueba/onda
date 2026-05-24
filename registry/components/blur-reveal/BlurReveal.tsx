import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, placementSchema, sizeRoleSchema, resolveSize } from '../../../lib/canvas';

/** Zod schema for {@link BlurReveal} props — drives Remotion `defaultProps` validation. */
export const blurRevealSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames until blur reaches 0 and the text is fully readable. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(96),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link BlurReveal}. */
export type BlurRevealProps = z.infer<typeof blurRevealSchema>;

/**
 * The reference Onda primitive: opacity, blur, and a 16px rise settle
 * together on `SPRING_SMOOTH` with no overshoot. Quietly cinematic.
 *
 * @example
 * <BlurReveal text="Onda" duration={20} />
 */
export const BlurReveal: React.FC<BlurRevealProps> = ({
  text, delay, duration, color, fontSize, size, fontFamily, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const local = Math.max(0, frame - delay);
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const blur = interpolate(progress, [0, 1], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        filter: `blur(${blur}px)`,
        transform: `translateY(${translateY}px)`,
        color, fontSize: resolvedFontSize, fontFamily, fontWeight: 600,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
