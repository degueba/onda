import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link GrainOverlay} props. */
export const grainOverlaySchema = z.object({
  /** Layer opacity. Capped at `0.15` — CLAUDE.md tokens say ~2%. */
  opacity: z.number().min(0).max(0.15).default(0.04),
  /** SVG turbulence base frequency. Higher = finer grain. */
  baseFrequency: z.number().min(0).default(0.9),
  /** Noise complexity. */
  numOctaves: z.number().int().min(1).max(4).default(1),
  /** Deterministic noise variation — same seed always produces the same grain. */
  seed: z.number().int().min(0).default(0),
});

/** Inferred props for {@link GrainOverlay}. */
export type GrainOverlayProps = z.infer<typeof grainOverlaySchema>;

/**
 * A subtle film-grain layer for the canvas — pure SVG turbulence, restrained
 * at 2–4% opacity. The catalog's first atmospheric primitive: no text, no
 * motion, just texture.
 *
 * Layer this over your composition with `<AbsoluteFill>` ordering.
 *
 * @example
 * <GrainOverlay opacity={0.04} />
 */
export const GrainOverlay: React.FC<GrainOverlayProps> = ({
  opacity, baseFrequency, numOctaves, seed,
}) => {
  // Unique-per-seed id so multiple GrainOverlay instances on the same canvas
  // don't share/clobber a single SVG <filter> definition.
  const filterId = `onda-grain-${seed}`;

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </AbsoluteFill>
  );
};
