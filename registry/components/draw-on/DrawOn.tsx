import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { z } from 'zod';
import { DURATION, SPRING_SMOOTH } from '../../../lib/motion';
import { PlacementBox, placementSchema } from '../../../lib/canvas';

/** Zod schema for {@link DrawOn} props. */
export const drawOnSchema = z.object({
  /** SVG path `d` attribute. The default is a gentle wave — on-brand. */
  d: z.string().default('M 10 50 Q 100 10 190 50'),
  /** Frames before stroking starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully stroke the path in. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Stroke color. Defaults to `--onda-text` (`#F2F2F4`). */
  stroke: z.string().default('#F2F2F4'),
  /** Stroke width in path coordinate units. */
  strokeWidth: z.number().default(3),
  /** SVG viewBox — must match the coordinate space of `d`. */
  viewBox: z.string().default('0 0 200 100'),
  /** Rendered width of the SVG in pixels. */
  width: z.number().default(800),
  /** Rendered height of the SVG in pixels. */
  height: z.number().default(400),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link DrawOn}. */
export type DrawOnProps = z.infer<typeof drawOnSchema>;

/**
 * An SVG path that strokes itself in — the substrate for logos, icons, and
 * signature flourishes. Powered by `@remotion/paths`'s `evolvePath`.
 *
 * @example
 * <DrawOn d="M 10 50 Q 100 10 190 50" duration={24} />
 */
export const DrawOn: React.FC<DrawOnProps> = ({
  d, delay, duration, stroke, strokeWidth, viewBox, width, height, placement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  // SPRING_SMOOTH-driven progress 0 → 1 keeps the stroke calm and settled.
  // No overshoot: the line lands at full length and stays — the Onda fingerprint.
  const progress = spring({
    frame: local,
    fps,
    config: SPRING_SMOOTH,
    durationInFrames: duration,
  });

  // evolvePath translates a 0–1 progress into the dasharray/dashoffset pair
  // needed to "draw" the path from its start to its end.
  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);

  return (
    <PlacementBox placement={placement}>
      <svg viewBox={viewBox} width={width} height={height} style={{ overflow: 'visible' }}>
        <path
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </PlacementBox>
  );
};
