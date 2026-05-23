import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';

export const kenBurnsSchema = z.object({
  // Stable Picsum seed so the playground render is reproducible across
  // machines. Users will supply their own `src` in real compositions.
  src: z.string().default('https://picsum.photos/seed/onda/1920/1080'),
  delay: z.number().int().min(0).default(0),       // frames before start
  duration: z.number().int().min(1).default(150),  // 5s @ 30fps — Ken Burns wants time
  fromScale: z.number().default(1.0),
  toScale: z.number().default(1.1),                // subtle zoom-in; keep restrained
  fromX: z.number().min(0).max(1).default(0.5),    // transform-origin X (0=left, 1=right)
  fromY: z.number().min(0).max(1).default(0.5),    // transform-origin Y (0=top, 1=bottom)
  toX: z.number().min(0).max(1).default(0.5),
  toY: z.number().min(0).max(1).default(0.5),
});

export type KenBurnsProps = z.infer<typeof kenBurnsSchema>;

export const KenBurns: React.FC<KenBurnsProps> = ({
  src, delay, duration, fromScale, toScale, fromX, fromY, toX, toY,
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

  // overflow: hidden is critical so the zoomed image doesn't bleed beyond
  // the canvas — without it, scale > 1 paints outside the composition.
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
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
    </AbsoluteFill>
  );
};
