import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';

export const countUpSchema = z.object({
  from: z.number().default(0),                              // starting value
  to: z.number().default(100),                              // ending value
  delay: z.number().int().min(0).default(0),                // frames before start
  duration: z.number().int().min(1).default(DURATION.slow), // counting wants more time than a text fade
  decimals: z.number().int().min(0).default(0),             // fraction digits to render
  prefix: z.string().default(''),                           // e.g. '$'
  suffix: z.string().default(''),                           // e.g. '%'
  color: z.string().default('#F2F2F4'),                     // --onda-text
  fontSize: z.number().default(120),                        // counters are usually large
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type CountUpProps = z.infer<typeof countUpSchema>;

export const CountUp: React.FC<CountUpProps> = ({
  from, to, delay, duration, decimals, prefix, suffix, color, fontSize, fontFamily,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Opacity rides the shared house spring via entryFade so the fade-in and
  // the counting curve settle together rather than racing each other.
  const { opacity } = entryFade({ frame, fps, delay, durationInFrames: duration });

  // Same SPRING_SMOOTH curve, computed independently so we can map it onto
  // the numeric range [from, to] without rebuilding the spring.
  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const value = interpolate(progress, [0, 1], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Locale-grouped (thousands separators) by default. en-US is fixed so the
  // render is deterministic across machines regardless of host locale.
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div style={{
      opacity,
      color, fontSize, fontFamily, fontWeight: 600,
      // tabular-nums keeps each digit slot a fixed width so the number
      // doesn't visibly shift left/right as digits change during the count.
      fontVariantNumeric: 'tabular-nums',
    }}>
      {prefix}{formatted}{suffix}
    </div>
  );
};
