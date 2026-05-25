import { z } from 'zod';
import { DURATION, STAGGER } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Timeline} props. */
export const timelineSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('timeline').default('timeline'),
  /** Anchor points along the timeline. Order is preserved — left to right. */
  points: z
    .array(z.object({ label: z.string() }))
    .default([
      { label: 'Concept' },
      { label: 'Build' },
      { label: 'Ship' },
      { label: 'Iterate' },
    ]),
  /** Frames before the line begins to draw. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which the horizontal line strokes itself on. */
  lineDuration: z.number().int().min(1).default(DURATION.slow),
  /** Frames between the line completing and the first dot appearing. */
  dotDelay: z.number().int().min(0).default(8),
  /** Frames between consecutive dot entrances. Canonical Onda stagger is `4`. */
  dotStagger: z.number().int().min(0).default(STAGGER),
  /** Per-dot entrance duration. */
  dotDuration: z.number().int().min(1).default(DURATION.base),
  /** Dot diameter in px. */
  dotSize: z.number().default(14),
  /** Line color. Defaults to `--onda-border`. */
  lineColor: z.string().default('#26262E'),
  /** Non-final dot color. Defaults to `--onda-text`. */
  dotColor: z.string().default('#F2F2F4'),
  /** Final dot color — the earned accent. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Label color. Defaults to `--onda-dim`. */
  labelColor: z.string().default('#8E8E98'),
  /** Label font size in px. */
  fontSize: z.number().default(22),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Timeline}. */
export type TimelineProps = z.infer<typeof timelineSchema>;
