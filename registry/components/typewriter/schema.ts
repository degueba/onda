import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { sizeRoleSchema, placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Typewriter} props. */
export const typewriterSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('typewriter').default('typewriter'),
  /** What to type out. */
  text: z.string().default('motion graphics'),
  /** Frames before typing starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to type the full string. Linear pacing — chars-per-frame is constant. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Show a blinking cursor at the leading edge. */
  cursor: z.boolean().default(true),
  /** Cursor color. Defaults to `--onda-accent` (`#D96B82`). */
  cursorColor: z.string().default('#D96B82'),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(64),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Body / technical font — Space Grotesk reads more "terminal" than Clash. */
  fontFamily: z.string().default('"Space Grotesk", sans-serif'),
  /** Font weight. Body / technical default `500`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'0.04em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.4` for body / multi-line copy. */
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

/** Inferred props for {@link Typewriter}. */
export type TypewriterProps = z.infer<typeof typewriterSchema>;
