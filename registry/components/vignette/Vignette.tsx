import React from 'react';
import { AbsoluteFill } from 'remotion';
import { vignetteSchema, type VignetteProps } from './schema';

export { vignetteSchema, type VignetteProps };

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
