import React from 'react';
import { interpolate } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { useSpringValue } from '../../../lib/hooks';
import { progressStepsSchema, type ProgressStepsProps } from './schema';

export { progressStepsSchema, type ProgressStepsProps };

/**
 * A horizontal stepper whose fill animates to the `current` step on the house
 * spring. Completed dots and the connecting track carry the earned accent;
 * pending steps stay neutral. The active step gets a soft glow ring.
 *
 * @example
 * <ProgressSteps steps={['Plan', 'Build', 'Ship']} current={2} />
 */
export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps, current, delay, duration, accentColor, dimColor, labelColor, fontFamily, fontSize, width, placement,
}) => {
  const p = useSpringValue({ delay, durationInFrames: duration });
  const filled = p * current; // 0..current, animated

  const dot = 30;
  return (
    <PlacementBox placement={placement}>
      <div style={{ width, display: 'flex', alignItems: 'flex-start' }}>
        {steps.map((label, i) => {
          const on = interpolate(filled, [i - 0.5, i], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const connector = i < steps.length - 1
            ? interpolate(filled, [i, i + 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 0;
          const dotColor = `color-mix(in srgb, ${accentColor} ${on * 100}%, ${dimColor})`;
          return (
            <div key={i} style={{ flex: i < steps.length - 1 ? 1 : '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div
                  style={{
                    width: dot, height: dot, borderRadius: 999, flex: '0 0 auto',
                    background: dotColor,
                    boxShadow: on > 0.6 ? `0 0 ${on * 24}px ${accentColor}` : undefined,
                  }}
                />
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 3, background: dimColor, position: 'relative', margin: '0 6px' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${connector * 100}%`, background: accentColor }} />
                  </div>
                )}
              </div>
              <span style={{ marginTop: 16, color: labelColor, fontFamily, fontSize, opacity: 0.5 + on * 0.5 }}>{label}</span>
            </div>
          );
        })}
      </div>
    </PlacementBox>
  );
};
