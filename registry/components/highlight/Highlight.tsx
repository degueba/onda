import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { highlightSchema, type HighlightProps } from './schema';

export { highlightSchema, type HighlightProps };

/**
 * Marker-style background reveal: text fades in, then an accent-rose bar
 * slides in behind it at full text-height. Two-phase reveal — text first,
 * accent second. One of the catalog's rare earned-color moments, reserved
 * for emphasis.
 *
 * @example
 * <Highlight text="motion graphics" />
 */
export const Highlight: React.FC<HighlightProps> = ({
  text,
  delay,
  duration,
  lineDelay,
  lineDuration,
  color,
  accentColor,
  fontSize,
  size,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  align,
  paddingX,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

  // Phase 1: text fade — opacity 0 → 1 on SPRING_SMOOTH.
  const { opacity } = entryFade({
    frame,
    fps,
    delay,
    durationInFrames: duration,
  });

  // Phase 2: highlight bar slides in after the text has landed, offset by lineDelay.
  const barProgress = spring({
    frame: Math.max(0, frame - delay - lineDelay),
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: lineDuration,
  });
  const barWidth = interpolate(barProgress, [0, 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: -paddingX,
            right: -paddingX,
            width: `calc(${barWidth}% + ${paddingX * 2}px)`,
            backgroundColor: accentColor,
            zIndex: 0,
          }}
        />
        <span
          style={{
            position: 'relative',
            zIndex: 1,
            opacity,
            color,
            fontSize: resolvedFontSize,
            fontFamily,
            fontWeight,
            letterSpacing,
            lineHeight,
            textAlign: align,
          }}
        >
          {text}
        </span>
      </div>
    </PlacementBox>
  );
};
