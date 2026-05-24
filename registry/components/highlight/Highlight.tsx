import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';
import { PlacementBox, placementSchema, sizeRoleSchema, resolveSize } from '../../../lib/canvas';

/** Zod schema for {@link Highlight} props. */
export const highlightSchema = z.object({
  /** Text to highlight. */
  text: z.string().default('highlight this'),
  /** Frames before the text starts revealing. */
  delay: z.number().int().min(0).default(0),
  /** Text reveal duration in frames. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Frames to wait after the text appears before the highlight slides in. */
  lineDelay: z.number().int().min(0).default(8),
  /** Highlight slide duration. Fast on purpose — emphatic. */
  lineDuration: z.number().int().min(1).default(DURATION.fast),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Highlight bar color. Defaults to `--onda-accent` (`#D96B82`) — the earned rose. */
  accentColor: z.string().default('#D96B82'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(64),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1`. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** Pixels past the text edges that the highlight bar extends. */
  paddingX: z.number().default(8),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Highlight}. */
export type HighlightProps = z.infer<typeof highlightSchema>;

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
