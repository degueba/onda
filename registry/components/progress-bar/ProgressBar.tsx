import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox } from '../../../lib/canvas';
import { progressBarSchema, type ProgressBarProps } from './schema';

export { progressBarSchema, type ProgressBarProps };

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
