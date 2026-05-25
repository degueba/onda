import { z } from 'zod';
import { DURATION, STAGGER } from '../../../lib/motion';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link WordStagger} props. */
export const wordStaggerSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('word-stagger').default('word-stagger'),
  /** The phrase. Split on whitespace into one reveal per word. */
  text: z.string().default('motion that moves you'),
  /** Frames before the **first** word starts. */
  delay: z.number().int().min(0).default(0),
  /** Per-word reveal duration. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Frames between consecutive words. Canonical Onda stagger is `4`. */
  stagger: z.number().int().min(0).default(STAGGER),
  /**
   * Horizontal alignment of the words within the WordStagger container.
   * With `flex-wrap: wrap`, this controls how each line's words sit
   * relative to the line — `'center'` lets long quotes wrap with each
   * line centered (used by QuoteCard); the default `'flex-start'`
   * left-aligns like a tagline.
   */
  justify: z.enum(['flex-start', 'center', 'flex-end']).default('flex-start'),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(64),
  /** Semantic typography role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `fontSize`'s default when passed alone; `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`, `'0.06em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1` for tight display copy. */
  lineHeight: z.number().optional(),
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

/** Inferred props for {@link WordStagger}. */
export type WordStaggerProps = z.infer<typeof wordStaggerSchema>;
