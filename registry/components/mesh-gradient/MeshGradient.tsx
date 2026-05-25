import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { seededRandom } from '../../../lib/random';
import { meshGradientSchema, type MeshGradientProps } from './schema';

export { meshGradientSchema, type MeshGradientProps };

/**
 * A soft mesh-gradient backdrop — colored blobs that drift slowly over the
 * near-black canvas. Motion is a pure function of the frame (sine drift keyed
 * off a seeded phase), so it loops cleanly and renders deterministically (§1).
 * Atmosphere, not subject: keep `speed` and `opacity` low.
 *
 * @example
 * <MeshGradient />
 */
export const MeshGradient: React.FC<MeshGradientProps> = ({
  colors, background, speed, seed, opacity,
}) => {
  const frame = useCurrentFrame();
  const rand = seededRandom(seed);

  const layers = colors.map((color) => {
    const phase = rand() * Math.PI * 2;
    const ampX = 16 + rand() * 14;
    const ampY = 14 + rand() * 14;
    const baseX = 25 + rand() * 50;
    const baseY = 25 + rand() * 50;
    const w = frame * 0.012 * speed;
    const x = baseX + Math.sin(w + phase) * ampX;
    const y = baseY + Math.cos(w * 0.8 + phase) * ampY;
    return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent 45%)`;
  });

  return (
    <AbsoluteFill style={{ background }}>
      <AbsoluteFill style={{ backgroundImage: layers.join(', '), opacity, filter: 'blur(8px)' }} />
    </AbsoluteFill>
  );
};
