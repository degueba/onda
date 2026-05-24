import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link KenBurns} props. */
export const kenBurnsSchema = z.object({
  /**
   * Image URL. The default is a stable Picsum seed so the playground render
   * is reproducible — supply your own `src` in real compositions.
   */
  src: z.string().default('https://picsum.photos/seed/onda/1920/1080'),
  /** Frames before the drift starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which the zoom + pan completes. 150f ≈ 5s @ 30fps. */
  duration: z.number().int().min(1).default(150),
  /** Starting scale. */
  fromScale: z.number().default(1.0),
  /** Ending scale. Keep the delta restrained (1.0 → 1.1). */
  toScale: z.number().default(1.1),
  /** Starting transform-origin X. `0` = left, `1` = right. */
  fromX: z.number().min(0).max(1).default(0.5),
  /** Starting transform-origin Y. `0` = top, `1` = bottom. */
  fromY: z.number().min(0).max(1).default(0.5),
  /** Ending transform-origin X. */
  toX: z.number().min(0).max(1).default(0.5),
  /** Ending transform-origin Y. */
  toY: z.number().min(0).max(1).default(0.5),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the component fills the entire canvas (default behavior). Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link KenBurns}. */
export type KenBurnsProps = z.infer<typeof kenBurnsSchema>;

/**
 * Slow zoom + pan over a photo — the iconic documentary motion. Restrained
 * scale (1.0 → 1.1 default) over ~5 seconds.
 *
 * Intentionally **linear** for the constant slow-cinematic feel. Springs at
 * this scale read as "the camera is accelerating" — wrong for Ken Burns.
 *
 * @example
 * <KenBurns src="/my-photo.jpg" toScale={1.1} />
 */
export const KenBurns: React.FC<KenBurnsProps> = ({
  src, delay, duration, fromScale, toScale, fromX, fromY, toX, toY, placement,
}) => {
  const frame = useCurrentFrame();

  // Intentionally linear (no spring, no easing) for a constant slow-cinematic
  // drift. Springs/eases at this 5-second scale read as "the camera is
  // accelerating" — wrong for Ken Burns, which is steady throughout.
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [fromScale, toScale], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const originX = interpolate(progress, [0, 1], [fromX, toX], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const originY = interpolate(progress, [0, 1], [fromY, toY], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const fillCanvas = placement === undefined;

  const img = (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale})`,
        transformOrigin: `${originX * 100}% ${originY * 100}%`,
      }}
    />
  );

  // overflow: hidden is critical so the zoomed image doesn't bleed beyond
  // the canvas — without it, scale > 1 paints outside the composition.
  if (fillCanvas) {
    return <AbsoluteFill style={{ overflow: 'hidden' }}>{img}</AbsoluteFill>;
  }

  return <PlacementBox placement={placement}>{img}</PlacementBox>;
};
