import React from 'react';
import { COLOR } from '../tokens';
import { RADIUS, SHADOW, SHEEN, BLUR, type ShadowToken } from '../elevation';

/**
 * The Onda raised surface — the shared material behind cards, code blocks,
 * device/browser frames, and any panel. One primitive so every surface in the
 * catalog shares the same border, radius, shadow, and optional glass blur +
 * top sheen (CLAUDE.md §2 "Surface polish").
 *
 * Position/size it from the parent (wrap in `PlacementBox` or set width/height);
 * `Surface` only owns the material, not where it sits.
 */
export type SurfaceProps = {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  /** `card` = opaque raised panel; `glass` = translucent + backdrop blur; `plain` = fill only. */
  variant?: 'card' | 'glass' | 'plain';
  radius?: number;
  padding?: number | string;
  /** Surface fill. Defaults per variant (surface token, or translucent for glass). */
  background?: string;
  borderColor?: string;
  shadow?: ShadowToken | 'none';
  /** Backdrop blur px for `glass`. Defaults to {@link BLUR.glass}. */
  blur?: number;
  /** Show the 1px top sheen. On by default for `card` / `glass`. */
  sheen?: boolean;
};

export const Surface: React.FC<SurfaceProps> = ({
  children,
  width,
  height,
  variant = 'card',
  radius = RADIUS.lg,
  padding,
  background,
  borderColor = COLOR.border,
  shadow = variant === 'plain' ? 'none' : 'card',
  blur = BLUR.glass,
  sheen,
}) => {
  const isGlass = variant === 'glass';
  const showSheen = sheen ?? variant !== 'plain';
  const fill =
    background ?? (isGlass ? 'rgba(14,14,18,0.55)' : variant === 'plain' ? 'transparent' : COLOR.surface);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        padding,
        borderRadius: radius,
        background: fill,
        border: `1px solid ${borderColor}`,
        boxShadow: shadow === 'none' ? undefined : SHADOW[shadow],
        backdropFilter: isGlass ? `blur(${blur}px)` : undefined,
        WebkitBackdropFilter: isGlass ? `blur(${blur}px)` : undefined,
        overflow: 'hidden',
      }}
    >
      {showSheen && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            backgroundImage: SHEEN,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
};
