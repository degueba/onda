import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { PlacementBox, resolveSize } from '../../../lib/canvas';
import { useEntrance } from '../../../lib/hooks';
import { buttonSchema, type ButtonProps } from './schema';

export { buttonSchema, type ButtonProps };

// Press-dip envelope: scale eases down to PRESS_SCALE over PRESS_IN frames,
// then springs back to 1 over PRESS_OUT. Short and tight so it reads as a
// physical click, not a bounce — no overshoot (CLAUDE.md §3).
const PRESS_SCALE = 0.94;
const PRESS_IN = 3;
const PRESS_OUT = 7;

/**
 * A CTA pill button — accent-filled (`primary`) or bordered (`ghost`). It
 * fades and rises in on the house entrance, then plays an optional click-dip
 * at `pressFrame`: a quick scale down to 0.94 and back, reading as a press.
 *
 * Fully deterministic (CLAUDE.md §1) — the dip is a pure function of the
 * frame's distance from `pressFrame`, no timers or state.
 *
 * @example
 * <Button label="Get started" placement="lower-third" />
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  variant,
  accent,
  press,
  pressFrame,
  delay,
  width,
  fontSize,
  size,
  fontFamily,
  placement,
}) => {
  const frame = useCurrentFrame();
  const { width: cw, height: ch } = useVideoConfig();
  const entrance = useEntrance({ type: 'rise', delay });

  const resolvedFontSize = size ? resolveSize(size, { width: cw, height: ch }) : fontSize;

  // Click-dip: down on the house ease into pressFrame, back out after it.
  // interpolate clamps outside the window, so the scale sits at 1 until the
  // dip begins and returns to 1 once it settles.
  const pressScale = press
    ? interpolate(
        frame,
        [pressFrame - PRESS_IN, pressFrame, pressFrame + PRESS_OUT],
        [1, PRESS_SCALE, 1],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        },
      )
    : 1;

  const isPrimary = variant === 'primary';
  const padV = Math.round(resolvedFontSize * 0.62);
  const padH = Math.round(resolvedFontSize * 1.4);

  return (
    <PlacementBox placement={placement}>
      <div style={{ opacity: entrance.opacity, transform: entrance.transform }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            width: width ?? 'auto',
            padding: `${padV}px ${padH}px`,
            borderRadius: 999,
            background: isPrimary ? accent : 'transparent',
            border: isPrimary
              ? '1px solid rgba(255,255,255,0.14)'
              : `1px solid ${accent}`,
            // Soft accent glow on primary; a quiet lift on ghost. Depth, not decoration.
            boxShadow: isPrimary
              ? `0 18px 40px -20px ${accent}, inset 0 1px 0 rgba(255,255,255,0.22)`
              : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            transform: `scale(${pressScale})`,
            transformOrigin: 'center',
          }}
        >
          <span
            style={{
              color: isPrimary ? 'var(--onda-bg, #08080A)' : accent,
              fontFamily,
              fontSize: resolvedFontSize,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </PlacementBox>
  );
};

export default Button;
