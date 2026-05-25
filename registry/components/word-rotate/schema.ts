import { z } from 'zod';
import { sizeRoleSchema, placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link WordRotate} props — drives Remotion `defaultProps` validation. */
export const wordRotateSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('word-rotate').default('word-rotate'),
  /** Phrases cycled in place, in order. One is visible at a time. */
  phrases: z.array(z.string()).default(['fast', 'beautiful', 'restrained']),
  /** Frames before the first phrase begins to enter. */
  delay: z.number().int().min(0).default(0),
  /** Frames each phrase holds at full opacity before the next arrives. */
  holdDuration: z.number().int().min(1).default(30),
  /** Frames for a single phrase to fade in (and, separately, fade out). */
  transitionDuration: z.number().int().min(1).default(12),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(96),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing. Default `'-0.02em'` matches the brand's tight display tracking. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1`. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link WordRotate}. */
export type WordRotateProps = z.infer<typeof wordRotateSchema>;
