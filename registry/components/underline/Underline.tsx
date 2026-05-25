import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';
import { resolveSize, PlacementBox } from '../../../lib/canvas';
import { underlineSchema, type UnderlineProps } from './schema';

export { underlineSchema, type UnderlineProps };

/**
 * Text that fades in, then an accent-rose underline draws beneath. Two-phase
 * reveal: text first, accent second. One of the catalog's rare earned-color
 * moments — reserved for emphasis.
 *
 * @example
 * <Underline text="motion graphics" />
 */
export const Underline: React.FC<UnderlineProps> = ({
  text,
  delay,
  duration,
  lineDelay,
  lineDuration,
  color,
  accentColor,
  lineThickness,
  lineOffset,
  fontSize,
  size,
  fontFamily,
  fontWeight,
  letterSpacing,
  lineHeight,
  align,
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

  // Phase 2: underline draws after the text has landed, offset by lineDelay.
  const lineProgress = spring({
    frame: Math.max(0, frame - delay - lineDelay),
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: lineDuration,
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PlacementBox placement={placement}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span
          style={{
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
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: -(lineOffset + lineThickness),
            height: lineThickness,
            width: `${lineWidth}%`,
            backgroundColor: accentColor,
            borderRadius: lineThickness / 2,
          }}
        />
      </div>
    </PlacementBox>
  );
};
