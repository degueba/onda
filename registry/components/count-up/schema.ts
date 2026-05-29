import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link CountUp} props. */
export const countUpSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('count-up').default('count-up'),
  /** Starting value. */
  from: z.number().default(0),
  /** Ending value. */
  to: z.number().default(100),
  /** Frames before the count starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to count from `from` to `to`. Numbers want more time than text. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Fraction digits to render. */
  decimals: z.number().int().min(0).default(0),
  /** Prepended to the number (e.g. `'$'`). */
  prefix: z.string().default(''),
  /** Appended to the number (e.g. `'%'`). */
  suffix: z.string().default(''),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Pixels. Counters are usually large. Wins over `size` if both are passed. */
  fontSize: z.number().default(120),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1`. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link CountUp}. */
export type CountUpProps = z.infer<typeof countUpSchema>;
