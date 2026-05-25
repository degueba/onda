import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { HOUSE_EASE } from '../../../lib/easing';
import { PlacementBox } from '../../../lib/canvas';
import { fadeOutSchema, type FadeOutProps } from './schema';

export { fadeOutSchema, type FadeOutProps };

/**
 * The inverse of {@link FadeIn}: a pure opacity exit. Opacity goes from 1 to 0
 * starting at `delay`, eased on `HOUSE_EASE`. Slightly faster than entrances
 * (`DURATION.fast`) so the moment ends without lingering — restraint applied
 * to exits as well.
 *
 * Motion is opacity-only by design — no transform, no blur, no scale. Per
 * `CLAUDE.md §4`, `HOUSE_EASE` on `interpolate` is the canonical curve for
 * fades.
 *
 * @example
 * <FadeOut text="Onda" delay={30} duration={10} />
 */
export const FadeOut: React.FC<FadeOutProps> = ({
  text, delay, duration, color, fontSize, fontFamily,
  fontWeight = 600, letterSpacing = 'normal', lineHeight = 1.1, align = 'left', placement,
}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - delay);

  const opacity = interpolate(local, [0, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: HOUSE_EASE,
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        color, fontSize, fontFamily, fontWeight, letterSpacing, lineHeight,
        textAlign: align,
      }}>
        {text}
      </div>
    </PlacementBox>
  );
};

export default FadeOut;
