import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { seededRandom } from '../../../lib/random';
import { confettiSchema, type ConfettiProps } from './schema';

export { confettiSchema, type ConfettiProps };

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * A celebratory confetti burst — a full-canvas layer. Pieces launch from an
 * origin, fan outward, arc under gravity, tumble, and fade. Every per-piece
 * value (angle, speed, spin, color, size) comes from a seeded PRNG, and all
 * motion is a pure function of the frame, so the same seed renders identically
 * every time (§1). Energetic but tasteful — the accent rides along with
 * neutrals. Drop it over your scene with `<AbsoluteFill>`.
 *
 * @example
 * <Confetti />
 */
export const Confetti: React.FC<ConfettiProps> = ({
  seed, count, colors, originX, originY, delay, duration, spread, gravity, pieceSize,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const rand = seededRandom(seed);

  const local = frame - delay;
  const ox = originX * width;
  const oy = originY * height;
  // Speed scaled to canvas + fps so the burst looks the same at any resolution.
  const speedScale = (Math.min(width, height) / 1080) * (30 / fps);
  const spreadRad = (spread * Math.PI) / 180;

  const pieces = Array.from({ length: count }, (_, i) => {
    // Draw a fixed slice of randoms per piece so order never shifts the result.
    const aJit = rand();
    const speed = 9 + rand() * 13;          // launch velocity (px/frame @ baseline)
    const spin = (rand() - 0.5) * 28;        // degrees/frame
    const spin0 = rand() * 360;              // initial rotation
    const color = colors[Math.floor(rand() * colors.length)] ?? colors[0];
    const wf = 0.7 + rand() * 0.6;           // size width factor (slim rectangles)
    const sizeJit = 0.7 + rand() * 0.8;      // per-piece size variation
    const lifeJit = 0.8 + rand() * 0.4;      // per-piece duration variation
    const drift = (rand() - 0.5) * 4;        // horizontal sway amplitude (deg)

    if (local < 0) return null;

    const life = duration * lifeJit;
    if (local > life) return null;

    const t = local; // frames since launch (already >= 0)
    // Aim around straight up (-90deg), fanned by spread.
    const angle = -Math.PI / 2 + (aJit - 0.5) * spreadRad;
    const vx = Math.cos(angle) * speed * speedScale;
    const vy = Math.sin(angle) * speed * speedScale;
    const g = 0.55 * gravity * speedScale;

    // Ballistic path: gravity pulls pieces back down over time.
    const x = ox + vx * t + Math.sin(t * 0.18 + i) * drift;
    const y = oy + vy * t + 0.5 * g * t * t;

    const opacity = interpolate(
      t,
      [0, life * 0.15, life * 0.7, life],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT },
    );

    const rotate = spin0 + spin * t;
    const w = pieceSize * sizeJit * wf;
    const h = pieceSize * sizeJit;

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: w,
          height: h,
          backgroundColor: color,
          borderRadius: 1,
          opacity,
          transform: `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${rotate}deg)`,
          willChange: 'transform, opacity',
        }}
      />
    );
  });

  return <AbsoluteFill>{pieces}</AbsoluteFill>;
};

export default Confetti;
