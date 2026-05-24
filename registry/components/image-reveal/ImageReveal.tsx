import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { entryFade, entryScale } from '../../../lib/choreography';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link ImageReveal} props. */
export const imageRevealSchema = z.object({
  /**
   * Image URL or path. The default is a stable Picsum seed so the playground
   * render is reproducible — supply your own `src` in real compositions.
   */
  src: z.string().default('https://picsum.photos/seed/onda-image-reveal/1920/1080'),
  /** Accessible alt text. */
  alt: z.string().default(''),
  /** Frames before the reveal starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully reveal. */
  duration: z.number().int().min(1).default(DURATION.base),
  /**
   * Which Onda motion fingerprint the entrance uses.
   * - `'blur'` — opacity + blur falloff + 16px rise (the BlurReveal fingerprint, for images).
   * - `'fade'` — opacity only.
   * - `'scale'` — opacity + subtle scale 0.95 → 1, no overshoot.
   */
  motion: z.enum(['blur', 'fade', 'scale']).default('blur'),
  /** How the image fits its box (`'cover'` crops to fill; `'contain'` letterboxes). */
  fit: z.enum(['cover', 'contain']).default('cover'),
  /**
   * Where on the canvas the image sits. Region (`'center'`, `'upper-third'`, ...)
   * or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the image
   * fills the entire canvas (matches `KenBurns` / `Parallax` defaults).
   */
  placement: placementSchema.optional(),
  /** Explicit width in px. When omitted, the image fills its container. */
  width: z.number().optional(),
  /** Explicit height in px. When omitted, the image fills its container. */
  height: z.number().optional(),
  /** Border radius in px. */
  borderRadius: z.number().default(0),
});

/** Inferred props for {@link ImageReveal}. */
export type ImageRevealProps = z.infer<typeof imageRevealSchema>;

/**
 * An image that enters with one of Onda's signature motion fingerprints.
 *
 * Wraps Remotion's `<Img>`. Default behavior fills the entire canvas
 * (mirroring `KenBurns` / `Parallax`); pass `placement` to position the
 * image as a sub-canvas element.
 *
 * Motion variants all use `SPRING_SMOOTH` — no overshoot, calm settle.
 *
 * @example
 * <ImageReveal src="/hero.jpg" motion="blur" />
 *
 * @example
 * <ImageReveal src="/portrait.jpg" placement="upper-third" width={480} height={640} motion="scale" />
 */
export const ImageReveal: React.FC<ImageRevealProps> = ({
  src, alt, delay, duration, motion, fit, placement, width, height, borderRadius,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve the chosen motion fingerprint. All three drive progress through
  // SPRING_SMOOTH (via the shared helpers or, for 'blur', inline math
  // matching BlurReveal — the catalog's reference primitive for that motion).
  let opacity = 1;
  let transform = '';
  let filter = '';

  if (motion === 'fade') {
    const r = entryFade({ frame, fps, delay, durationInFrames: duration });
    opacity = r.opacity;
  } else if (motion === 'scale') {
    const r = entryScale({ frame, fps, delay, durationInFrames: duration, from: 0.95 });
    opacity = r.opacity;
    transform = r.transform;
  } else {
    // 'blur' — no entryBlur helper exists, so inline the same math as BlurReveal.
    const local = Math.max(0, frame - delay);
    const progress = spring({
      frame: local,
      fps,
      config: SPRING_SMOOTH,
      durationInFrames: duration,
    });
    opacity = interpolate(progress, [0, 1], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const blur = interpolate(progress, [0, 1], [10, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    const translateY = interpolate(progress, [0, 1], [16, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    filter = `blur(${blur}px)`;
    transform = `translateY(${translateY}px)`;
  }

  const imgStyle: React.CSSProperties = {
    objectFit: fit,
    borderRadius,
    opacity,
    transform,
    filter,
    display: 'block',
    width,
    height,
  };

  // `placement` opt-in: when omitted, the image fills the canvas (mirrors
  // KenBurns / Parallax — the most common "hero photo" case). When set, the
  // image becomes a sub-canvas element positioned via PlacementBox.
  if (placement === undefined) {
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img
          src={src}
          alt={alt}
          style={{
            ...imgStyle,
            width: width ?? '100%',
            height: height ?? '100%',
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <PlacementBox placement={placement}>
      <Img src={src} alt={alt} style={imgStyle} />
    </PlacementBox>
  );
};
