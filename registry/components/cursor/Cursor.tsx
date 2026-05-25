import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { useSpringValue } from '../../../lib/hooks';
import { cursorSchema, type CursorProps } from './schema';

export { cursorSchema, type CursorProps };

/**
 * An animated pointer that travels from one canvas point to another on the
 * house spring and emits a single restrained click ripple on arrival. A
 * full-canvas layer — position it with the `from*` / `to*` fractions, not
 * placement. Pairs with `code-block` / `terminal` / `browser-frame` for
 * product and dev demos.
 *
 * @example
 * <Cursor fromX={0.3} fromY={0.7} toX={0.6} toY={0.4} />
 */
export const Cursor: React.FC<CursorProps> = ({
  fromX, fromY, toX, toY, delay, travelDuration, click, clickDelay, color, size,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = useSpringValue({ delay, durationInFrames: travelDuration });

  const x = interpolate(p, [0, 1], [fromX, toX]) * width;
  const y = interpolate(p, [0, 1], [fromY, toY]) * height;

  const clickFrame = delay + travelDuration + clickDelay;
  const ripple = click
    ? interpolate(frame, [clickFrame, clickFrame + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  // A brief press-down on the pointer at the click moment.
  const press = click
    ? interpolate(frame, [clickFrame, clickFrame + 4, clickFrame + 9], [1, 0.86, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  const ringSize = size * 1.4;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-4px, -2px)' }}>
        {/* click ripple */}
        {ripple > 0 && ripple < 1 && (
          <div
            style={{
              position: 'absolute',
              left: -ringSize / 2 + 6,
              top: -ringSize / 2 + 4,
              width: ringSize,
              height: ringSize,
              borderRadius: 999,
              border: `2px solid ${color}`,
              transform: `scale(${interpolate(ripple, [0, 1], [0.2, 1.4])})`,
              opacity: interpolate(ripple, [0, 1], [0.6, 0]),
            }}
          />
        )}
        {/* pointer */}
        <svg
          width={size * 0.62}
          height={size}
          viewBox="0 0 40 64"
          style={{ display: 'block', transform: `scale(${press})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
        >
          <path
            d="M4 2 L4 46 L15 36 L22 54 L30 50 L23 33 L38 33 Z"
            fill={color}
            stroke="#08080A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
