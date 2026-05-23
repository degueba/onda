import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';
import { DURATION } from '../../../lib/motion';

export const typewriterSchema = z.object({
  text: z.string().default('motion graphics'),
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.slow), // frames to fully type out
  cursor: z.boolean().default(true),
  cursorColor: z.string().default('#D96B82'),               // --onda-accent
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(64),
  fontFamily: z.string().default('"Space Grotesk", sans-serif'),
});

export type TypewriterProps = z.infer<typeof typewriterSchema>;

export const Typewriter: React.FC<TypewriterProps> = ({
  text, delay, duration, cursor, cursorColor, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
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
      fontSize,
      fontFamily,
      fontWeight: 500,
    }}>
      {revealed}
      <span style={{ color: cursorColor, opacity: cursorOpacity }}>|</span>
    </div>
  );
};
