import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';

/** Zod schema for {@link Underline} props. */
export const underlineSchema = z.object({
  /** Text to reveal. Pass `""` to render the rule alone. */
  text: z.string().default('underline this'),
  /** Frames before the text starts revealing. */
  delay: z.number().int().min(0).default(0),
  /** Text reveal duration in frames. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Frames to wait after the text appears before the line starts drawing. */
  lineDelay: z.number().int().min(0).default(8),
  /** Line draw duration. Fast on purpose — emphatic. */
  lineDuration: z.number().int().min(1).default(DURATION.fast),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Line color. Defaults to `--onda-accent` (`#D96B82`) — the earned rose. */
  accentColor: z.string().default('#D96B82'),
  /** Line thickness in px. */
  lineThickness: z.number().default(3),
  /** Pixel gap between text baseline and the line. */
  lineOffset: z.number().default(6),
  /** Pixels. */
  fontSize: z.number().default(64),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link Underline}. */
export type UnderlineProps = z.infer<typeof underlineSchema>;

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
  fontFamily,
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
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          opacity,
          color,
          fontSize,
          fontFamily,
          fontWeight: 600,
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
  );
};
