import { z } from 'zod';
import { DURATION, STAGGER } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link StaggerGroup} props. */
export const staggerGroupSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('stagger-group').default('stagger-group'),
  /** The items to reveal, in order. */
  items: z
    .array(z.string())
    .default(['Less is more', 'Calm is power', 'Motion has a feel', 'Made to be edited']),
  /** Frames before the **first** item starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames between consecutive items. Canonical Onda stagger is `4`. */
  stagger: z.number().int().min(0).default(STAGGER),
  /** Per-item reveal duration. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Layout direction for the items. */
  direction: z.enum(['column', 'row']).default('column'),
  /** Pixels between items. */
  gap: z.number().int().min(0).default(16),
  /** Cross-axis alignment. */
  align: z.enum(['start', 'center', 'end']).default('center'),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(48),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`, `'0.06em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1` for tight display copy. */
  lineHeight: z.number().optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link StaggerGroup}. */
export type StaggerGroupProps = z.infer<typeof staggerGroupSchema>;
