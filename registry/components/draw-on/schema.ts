import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link DrawOn} props. */
export const drawOnSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('draw-on').default('draw-on'),
  /** SVG path `d` attribute. The default is a gentle wave — on-brand. */
  d: z.string().default('M 10 50 Q 100 10 190 50'),
  /** Frames before stroking starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully stroke the path in. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Stroke color. Defaults to `--onda-text` (`#F2F2F4`). */
  stroke: z.string().default('var(--onda-text, #F2F2F4)'),
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
