import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox } from '../../../lib/canvas';
import { maskRevealSchema, type MaskRevealProps } from './schema';

export { maskRevealSchema, type MaskRevealProps };

/**
 * Reveals text from behind a retreating clip-path mask. Hard, pixel-sharp
 * edge by design — no opacity fade. The moving edge IS the fingerprint.
 *
 * @example
 * <MaskReveal text="Onda" direction="left" />
 */
export const MaskReveal: React.FC<MaskRevealProps> = ({
  text, delay, duration, direction, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left',
  textTransform, textShadow, fontStyle, textWrap, placement,
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
        textTransform, textShadow, fontStyle, textWrap,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};
