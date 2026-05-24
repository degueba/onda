import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade } from '../../../lib/choreography';
import { PlacementBox, placementSchema, sizeRoleSchema, resolveSize } from '../../../lib/canvas';

/** Zod schema for {@link CountUp} props. */
export const countUpSchema = z.object({
  /** Starting value. */
  from: z.number().default(0),
  /** Ending value. */
  to: z.number().default(100),
  /** Frames before the count starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to count from `from` to `to`. Numbers want more time than text. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Fraction digits to render. */
  decimals: z.number().int().min(0).default(0),
  /** Prepended to the number (e.g. `'$'`). */
  prefix: z.string().default(''),
  /** Appended to the number (e.g. `'%'`). */
  suffix: z.string().default(''),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Counters are usually large. Wins over `size` if both are passed. */
  fontSize: z.number().default(120),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link CountUp}. */
export type CountUpProps = z.infer<typeof countUpSchema>;

/**
 * An animated number that counts from `from` to `to` on `SPRING_SMOOTH`.
 * Tabular nums, en-US grouping, deterministic across machines.
 *
 * @example
 * <CountUp from={0} to={1247} prefix="$" suffix="+" />
 */
export const CountUp: React.FC<CountUpProps> = ({
  from, to, delay, duration, decimals, prefix, suffix, color, fontSize, size, fontFamily, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const resolvedFontSize = size ? resolveSize(size, { width, height }) : fontSize;

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
    <PlacementBox placement={placement}>
      <div style={{
        opacity,
        color, fontSize: resolvedFontSize, fontFamily, fontWeight: 600,
        // tabular-nums keeps each digit slot a fixed width so the number
        // doesn't visibly shift left/right as digits change during the count.
        fontVariantNumeric: 'tabular-nums',
      }}>
        {prefix}{formatted}{suffix}
      </div>
    </PlacementBox>
  );
};
