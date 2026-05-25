import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link RotateIn} props. */
export const rotateInSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('rotate-in').default('rotate-in'),
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to settle to 0°. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Starting angle in degrees. Safe zone: `[-12, +12]`. */
  fromAngle: z.number().default(-8),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`, `'0.06em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1` for tight display copy. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** CSS text-transform. Useful for eyebrow / kicker copy. */
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  /** CSS text-shadow value (e.g. `'0 4px 24px rgba(0,0,0,0.55)'`). Useful for readability over busy backgrounds. */
  textShadow: z.string().optional(),
  /** CSS font-style. */
  fontStyle: z.enum(['normal', 'italic', 'oblique']).optional(),
  /** CSS text-wrap. `'balance'` evens out headline line-breaks; `'pretty'` polishes body text. */
  textWrap: z.enum(['wrap', 'nowrap', 'balance', 'pretty']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link RotateIn}. */
export type RotateInProps = z.infer<typeof rotateInSchema>;
