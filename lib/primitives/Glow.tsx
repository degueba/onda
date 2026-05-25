import React from 'react';
import { COLOR } from '../tokens';

/**
 * A soft radial glow layer — the single restrained accent glow a section is
 * allowed (CLAUDE.md §2). Renders an absolutely-positioned, non-interactive
 * radial gradient; drop it behind content inside a positioned parent.
 *
 * Defaults to the Onda accent. Keep it to one per major moment — depth, not
 * decoration.
 */
export type GlowProps = {
  /** Glow color. Defaults to `--onda-accent`. */
  color?: string;
  /** Diameter as a fraction of the parent's smaller axis (0..1+). */
  size?: number;
  /** Center X / Y as 0..1 fractions of the parent. Default center. */
  x?: number;
  y?: number;
  /** Peak opacity at the center. */
  opacity?: number;
};

export const Glow: React.FC<GlowProps> = ({
  color = COLOR.accent,
  size = 0.8,
  x = 0.5,
  y = 0.5,
  opacity = 0.35,
}) => {
  const radius = `${size * 60}%`;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(circle ${radius} at ${x * 100}% ${y * 100}%, ${color}, transparent 70%)`,
        opacity,
      }}
    />
  );
};
