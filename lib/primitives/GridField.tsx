import React from 'react';
import { COLOR } from '../tokens';

/**
 * A deterministic background grid — lines or dots — for technical / dashboard
 * surfaces. Pure CSS gradients, no per-cell elements, so it's cheap and
 * SSR-safe. Drop it as a full-bleed layer behind content.
 */
export type GridFieldProps = {
  /** Cell size in px. */
  cell?: number;
  /** `lines` = ruled grid; `dots` = dot lattice. */
  variant?: 'lines' | 'dots';
  /** Line/dot color. Defaults to `--onda-border`. */
  color?: string;
  /** Stroke thickness (lines) / dot radius px (dots). */
  thickness?: number;
  /** Layer opacity. Keep low — a grid is scaffold, not subject. */
  opacity?: number;
};

export const GridField: React.FC<GridFieldProps> = ({
  cell = 48,
  variant = 'lines',
  color = COLOR.border,
  thickness = 1,
  opacity = 0.6,
}) => {
  const background =
    variant === 'dots'
      ? `radial-gradient(circle ${thickness}px at ${thickness}px ${thickness}px, ${color} 99%, transparent 100%)`
      : `linear-gradient(to right, ${color} ${thickness}px, transparent ${thickness}px), linear-gradient(to bottom, ${color} ${thickness}px, transparent ${thickness}px)`;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        backgroundImage: background,
        backgroundSize: `${cell}px ${cell}px`,
      }}
    />
  );
};
