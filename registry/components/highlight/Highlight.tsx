import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';

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
  /** Pixels. */
  fontSize: z.number().default(64),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Pixels past the text edges that the highlight bar extends. */
  paddingX: z.number().default(8),
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
  fontFamily,
  paddingX,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
          fontSize,
          fontFamily,
          fontWeight: 600,
        }}
      >
        {text}
      </span>
    </div>
  );
};
