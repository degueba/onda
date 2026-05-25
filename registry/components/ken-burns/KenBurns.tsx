import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';
import { PlacementBox } from '../../../lib/canvas';
import { kenBurnsSchema, type KenBurnsProps } from './schema';

export { kenBurnsSchema, type KenBurnsProps };

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
