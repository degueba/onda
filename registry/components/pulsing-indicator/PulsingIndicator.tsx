import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { pulsingIndicatorSchema, type PulsingIndicatorProps } from './schema';

export { pulsingIndicatorSchema, type PulsingIndicatorProps };

/**
 * A live status dot with a calm expanding-ring pulse, plus an optional label.
 * The pulse is keyed off `frame % period`, so it loops seamlessly and renders
 * deterministically (§1) — no timers. One steady ring, not a strobe.
 *
 * @example
 * <PulsingIndicator label="LIVE" />
 */
export const PulsingIndicator: React.FC<PulsingIndicatorProps> = ({
  color, size, label, labelColor, fontFamily, fontSize, period, placement,
}) => {
  const frame = useCurrentFrame();
  const t = ((frame % period) + period) % period / period;
  const ringScale = interpolate(t, [0, 1], [1, 2.6]);
  const ringOpacity = interpolate(t, [0, 1], [0.5, 0]);

  return (
    <PlacementBox placement={placement}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.7 }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              background: color,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
            }}
          />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: color }} />
        </div>
        {label && (
          <span style={{ color: labelColor, fontFamily, fontSize, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {label}
          </span>
        )}
      </div>
    </PlacementBox>
  );
};
