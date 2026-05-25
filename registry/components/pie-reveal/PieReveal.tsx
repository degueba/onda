import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link PieReveal} props. */
export const pieRevealSchema = z.object({
  /** Percentage to reveal, 0–100. */
  value: z.number().min(0).max(100).default(64),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames until the arc has fully filled to `value`. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Arc radius in pixels. */
  radius: z.number().default(120),
  /** Stroke width of both the track and the arc, in pixels. */
  strokeWidth: z.number().default(12),
  /** Arc color. Defaults to `--onda-accent` (`#D96B82`). */
  accentColor: z.string().default('#D96B82'),
  /** Track (background ring) color. Defaults to `--onda-border-lit` (`#26262E`). */
  trackColor: z.string().default('#26262E'),
  /** Render the `value%` label in the center of the ring. */
  showValue: z.boolean().default(true),
  /** Color of the center `%` label. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Center label font size in pixels. */
  fontSize: z.number().default(56),
  /** Center label font family. The Onda display font by default. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link PieReveal}. */
export type PieRevealProps = z.infer<typeof pieRevealSchema>;

/**
 * A single-arc pie reveal — the SVG arc fills from 0 to `value` percent on
 * `SPRING_SMOOTH`, starting at 12 o'clock and sweeping clockwise. One muted
 * accent stroke against a quiet track; the center holds the `value%` label.
 *
 * Calm and settled, no overshoot — the Onda data primitive.
 *
 * @example
 * <PieReveal value={72} duration={24} />
 */
export const PieReveal: React.FC<PieRevealProps> = ({
  value,
  delay,
  duration,
  radius,
  strokeWidth,
  accentColor,
  trackColor,
  showValue,
  color,
  fontSize,
  fontFamily,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // SPRING_SMOOTH-driven 0→1 progress: the arc settles to its target length
  // without overshoot — the same fingerprint as every other Onda reveal.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  const arcPercent = interpolate(progress, [0, 1], [0, value], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // SVG arc math: stroke-dasharray = circumference, then drive the visible
  // portion by reducing stroke-dashoffset from `circumference` to the value
  // proportional offset.
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - arcPercent / 100);

  // Square viewBox sized to fit the full ring stroke without clipping.
  const size = radius * 2 + strokeWidth * 2;
  const center = size / 2;

  return (
    <PlacementBox placement={placement}>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          // Rotate so the arc starts at 12 o'clock and sweeps clockwise.
          style={{ transform: 'rotate(-90deg)', display: 'block' }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${dashOffset}`}
          />
        </svg>
        {showValue && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              fontFamily,
              fontSize,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            {`${Math.round(arcPercent)}%`}
          </div>
        )}
      </div>
    </AbsoluteFill>
    </PlacementBox>
  );
};

export default PieReveal;
