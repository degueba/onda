import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link Vignette} props. */
export const vignetteSchema = z.object({
  /** Edge darkness. `0` = no vignette, `1` = fully dark edges. */
  intensity: z.number().min(0).max(1).default(0.5),
  /** Percent from center where the darkening begins. Larger = bigger clean middle. */
  innerRadius: z.number().min(0).max(100).default(40),
  /** Edge color. Defaults to pure black for the classic cinematic frame. */
  color: z.string().default('#000000'),
});

/** Inferred props for {@link Vignette}. */
export type VignetteProps = z.infer<typeof vignetteSchema>;

/**
 * A static cinematic vignette — a radial darkening at the canvas edges that
 * pulls the eye toward the center. Atmospheric layer, no motion: deliberately
 * still, like {@link GrainOverlay}. Output is identical on every frame, so the
 * component is deterministic by construction without reading `useCurrentFrame`.
 *
 * `pointerEvents: 'none'` keeps it from intercepting interaction in the Studio
 * / Player when layered above other content.
 *
 * @example
 * <Vignette intensity={0.5} innerRadius={40} color="#000000" />
 */
export const Vignette: React.FC<VignetteProps> = ({
  intensity, innerRadius, color,
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, transparent ${innerRadius}%, ${color} 100%)`,
        opacity: intensity,
      }}
    />
  );
};
