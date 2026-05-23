import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';

/** Zod schema for {@link Parallax} props. */
export const parallaxSchema = z.object({
  /**
   * Image URL. The default is a stable Picsum seed so the playground render
   * is reproducible — supply your own `src` in real compositions.
   */
  src: z.string().default('https://picsum.photos/seed/onda-parallax/1920/1080'),
  /** Frames before the drift starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which the drift completes. 180f ≈ 6s @ 30fps — parallax wants time. */
  duration: z.number().int().min(1).default(180),
  /** Drift direction. The image moves *toward* this edge as time advances. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /** Total drift distance in pixels across `duration`. Keep restrained. */
  distance: z.number().default(40),
});

/** Inferred props for {@link Parallax}. */
export type ParallaxProps = z.infer<typeof parallaxSchema>;

/**
 * Slow horizontal or vertical drift over an image — a lighter, no-zoom
 * complement to {@link KenBurns}. Used for backgrounds and b-roll where the
 * frame should feel alive without pulling focus.
 *
 * Intentionally **linear** (joins the linear-by-design club with KenBurns,
 * Marquee, Typewriter). At a 6-second scale a spring or ease would read as
 * the camera accelerating — wrong for parallax, which is steady throughout.
 *
 * @example
 * <Parallax src="/my-photo.jpg" direction="left" distance={40} />
 */
export const Parallax: React.FC<ParallaxProps> = ({
  src, delay, duration, direction, distance,
}) => {
  const frame = useCurrentFrame();

  // Linear by design — constant drift, no acceleration. See KenBurns for the
  // same rationale at the same time scale.
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const offset = progress * distance;

  // Axis + sign per direction. Left/up are negative translations; right/down
  // positive. The image rides scale(1.05) below so translation never reveals
  // empty edges of the canvas.
  const tx = direction === 'left' ? -offset : direction === 'right' ? offset : 0;
  const ty = direction === 'up' ? -offset : direction === 'down' ? offset : 0;

  // overflow: hidden is critical so the slightly-oversized image (scale 1.05)
  // doesn't bleed beyond the canvas bounds.
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${tx}px, ${ty}px) scale(1.05)`,
        }}
      />
    </AbsoluteFill>
  );
};
