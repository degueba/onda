import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link MaskReveal} props. */
export const maskRevealSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames for the mask to fully retreat. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** The side the text appears to come *in* from (mirrors `SlideIn`). */
  direction: z.enum(['left', 'right', 'top', 'bottom']).default('left'),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`, `'0.06em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1` for tight display copy. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link MaskReveal}. */
export type MaskRevealProps = z.infer<typeof maskRevealSchema>;

/**
 * Reveals text from behind a retreating clip-path mask. Hard, pixel-sharp
 * edge by design — no opacity fade. The moving edge IS the fingerprint.
 *
 * @example
 * <MaskReveal text="Onda" direction="left" />
 */
export const MaskReveal: React.FC<MaskRevealProps> = ({
  text, delay, duration, direction, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left', placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // Spring-driven mask retreat. The text is rendered fully from frame 0;
  // only the clip-path inset shrinks, so the reveal edge stays crisp —
  // that hard edge IS the fingerprint of this primitive. No opacity fade.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  // Percentage of the element still covered by the mask: 100 → 0.
  const cover = interpolate(progress, [0, 1], [100, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // `direction` names the side the text comes IN from (mirrors SlideIn).
  // So the mask sits on the OPPOSITE side and retreats toward that side.
  //   inset(top right bottom left)
  let clipPath: string;
  switch (direction) {
    case 'left':
      // text enters from the left → mask covers the right side
      clipPath = `inset(0 ${cover}% 0 0)`;
      break;
    case 'right':
      // text enters from the right → mask covers the left side
      clipPath = `inset(0 0 0 ${cover}%)`;
      break;
    case 'top':
      // text enters from the top → mask covers the bottom
      clipPath = `inset(0 0 ${cover}% 0)`;
      break;
    case 'bottom':
      // text enters from the bottom → mask covers the top
      clipPath = `inset(${cover}% 0 0 0)`;
      break;
  }

  return (
    <PlacementBox placement={placement}>
      <div style={{
        clipPath,
        WebkitClipPath: clipPath,
        color, fontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
