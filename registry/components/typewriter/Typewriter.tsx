import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { sizeRoleSchema, resolveSize } from '../../../lib/canvas';

/** Zod schema for {@link Typewriter} props. */
export const typewriterSchema = z.object({
  /** What to type out. */
  text: z.string().default('motion graphics'),
  /** Frames before typing starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to type the full string. Linear pacing — chars-per-frame is constant. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Show a blinking cursor at the leading edge. */
  cursor: z.boolean().default(true),
  /** Cursor color. Defaults to `--onda-accent` (`#D96B82`). */
  cursorColor: z.string().default('#D96B82'),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(64),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Body / technical font — Space Grotesk reads more "terminal" than Clash. */
  fontFamily: z.string().default('"Space Grotesk", sans-serif'),
});

/** Inferred props for {@link Typewriter}. */
export type TypewriterProps = z.infer<typeof typewriterSchema>;

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
    <div style={{
      color,
      fontSize: resolvedFontSize,
      fontFamily,
      fontWeight: 500,
    }}>
      {revealed}
      <span style={{ color: cursorColor, opacity: cursorOpacity }}>|</span>
    </div>
  );
};
