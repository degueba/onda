import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

export const grainOverlaySchema = z.object({
  opacity: z.number().min(0).max(0.15).default(0.04),  // restraint cap — CLAUDE.md tokens say ~2%
  baseFrequency: z.number().min(0).default(0.9),       // higher = finer grain
  numOctaves: z.number().int().min(1).max(4).default(1), // noise complexity
  seed: z.number().int().min(0).default(0),            // deterministic noise variation
});

export type GrainOverlayProps = z.infer<typeof grainOverlaySchema>;

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
