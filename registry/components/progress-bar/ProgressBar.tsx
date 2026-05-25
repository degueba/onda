import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link ProgressBar} props. */
export const progressBarSchema = z.object({
  /** Target fill, 0–100. The bar grows from 0 to this value. */
  value: z.number().min(0).max(100).default(64),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to reach the full target value. Bars want more time than text. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Bar thickness in px. */
  height: z.number().default(12),
  /** Border-radius in px. Defaults to a full pill. */
  radius: z.number().default(999),
  /** Track color — the unfilled portion. Defaults to `--onda-border-lit`. */
  trackColor: z.string().default('#26262E'),
  /** Fill color — the earned accent. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Whether to render the `${value}%` label beside the bar. */
  showValue: z.boolean().default(true),
  /** Label color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Label font size in px. */
  fontSize: z.number().default(28),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link ProgressBar}. */
export type ProgressBarProps = z.infer<typeof progressBarSchema>;

/**
 * A horizontal bar that fills from 0 to `value`% on `SPRING_SMOOTH`. Solid
 * dusty-rose accent on a neutral track. Optional `${value}%` label sits to
 * the right of the bar — one calm, single-focal moment, no overshoot.
 *
 * @example
 * <ProgressBar value={72} />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, delay, duration, height, radius,
  trackColor, accentColor, showValue, color, fontSize, fontFamily, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  // Clamp the fill at 100% so out-of-range `value` never overflows the track.
  // Schema already enforces 0–100, but this keeps the component correct under
  // any caller mistake or future schema relaxation.
  const targetPct = Math.max(0, Math.min(100, value));

  const fillPct = interpolate(progress, [0, 1], [0, targetPct], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PlacementBox placement={placement}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        color,
        fontSize,
        fontFamily,
        fontWeight: 500,
        // Without an explicit width the row shrinks to its label content and
        // the `flex: 1` track collapses to zero. 80% of canvas gives the bar
        // somewhere to grow into while leaving generous side margins. Same
        // gotcha as BarChart — see CLAUDE.md component contract.
        width: '80%',
        maxWidth: 800,
        // Self-center inside any wider parent. Flex-centering parents
        // are unaffected; non-flex parents (e.g. a fixed-width wrapper)
        // would otherwise leave the bar flush-left.
        marginInline: 'auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          height,
          background: trackColor,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${fillPct}%`,
            height: '100%',
            background: accentColor,
            borderRadius: radius,
          }}
        />
      </div>
      {showValue ? (
        <div
          style={{
            flexShrink: 0,
            color,
            // Reserve enough space for "100%" so the bar's right edge does not
            // shift as the label renders. A monospace tabular feel without
            // changing the font family.
            minWidth: '4ch',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(targetPct)}%
        </div>
      ) : null}
    </div>
    </PlacementBox>
  );
};
