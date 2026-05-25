import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { resolveSize, PlacementBox } from '../../../lib/canvas';
import { typewriterSchema, type TypewriterProps } from './schema';

export { typewriterSchema, type TypewriterProps };

/**
 * Character-by-character text reveal with an optional accent-rose cursor.
 *
 * Intentionally **linear** — the one documented exception to the house spring
 * rule, because typing has to feel constant-rate.
 *
 * @example
 * <Typewriter text="motion graphics" cursor />
 */
export const Typewriter: React.FC<TypewriterProps> = ({
  text, delay, duration, cursor, cursorColor, color, fontSize, size, fontFamily,
  fontWeight = 500, letterSpacing = 'normal', lineHeight = 1.4, align = 'left',
  textTransform, textShadow, fontStyle, textWrap, placement,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;
  const local = Math.max(0, frame - delay);

  // Linear progress is deliberate here. Typing has its own rhythm; a spring
  // would make chars-per-frame uneven (fast in the middle, crawling at the
  // ends) and break the constant-rate feel of real typing. This is the one
  // place in the Onda catalog where we intentionally use linear pacing.
  const progress = interpolate(local, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const charsToShow = Math.floor(progress * text.length);
  const revealed = text.slice(0, charsToShow);

  // Deterministic cursor blink — derived purely from the current frame so it
  // is correct on any single frame with no knowledge of prior frames. Toggles
  // every 15 frames (0.5s at 30fps).
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;
  const showCursor = cursor && progress < 1;
  const cursorOpacity = showCursor && cursorVisible ? 1 : 0;

  return (
    <PlacementBox placement={placement}>
      <div style={{
        color,
        fontSize: resolvedFontSize,
        fontFamily,
        fontWeight,
        letterSpacing,
        lineHeight,
        textAlign: align,
        textTransform,
        textShadow,
        fontStyle,
        textWrap,
      }}>
        {revealed}
        <span style={{ color: cursorColor, opacity: cursorOpacity }}>|</span>
      </div>
    </PlacementBox>
  );
};
