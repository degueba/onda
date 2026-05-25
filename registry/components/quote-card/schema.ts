import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link QuoteCard} props. */
export const quoteCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('quote-card').default('quote-card'),
  /** The pull-quote body. Cascaded word-by-word on a slower-than-canonical stagger. */
  quote: z.string().default('Motion is the difference between art and craft.'),
  /** Attribution name. */
  author: z.string().default('Saul Bass'),
  /** Attribution role / title. */
  role: z.string().default('Graphic Designer'),
  /** Frames before the quote starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent divider between quote and attribution. */
  accent: z.boolean().default(true),
  /** Quote font size in px. Wins over `quoteSize` if both are passed. */
  quoteFontSize: z.number().default(56),
  /** Semantic role for the quote — resolves to canvas-aware pixels. `quoteFontSize` wins when both are passed. */
  quoteSize: sizeRoleSchema.optional(),
  /** Font weight for the quote. */
  quoteFontWeight: z.number().optional(),
  /** CSS letter-spacing for the quote (e.g. `'-0.02em'`). */
  quoteLetterSpacing: z.string().optional(),
  /** Unitless line height for the quote. */
  quoteLineHeight: z.number().optional(),
  /** Author / role font size in px. Wins over `authorSize` if both are passed. */
  authorFontSize: z.number().default(22),
  /** Semantic role for the author / role — resolves to canvas-aware pixels. `authorFontSize` wins when both are passed. */
  authorSize: sizeRoleSchema.optional(),
  /** Font weight for the author and role lines (they share styling). */
  authorFontWeight: z.number().optional(),
  /** CSS letter-spacing for the author and role lines (e.g. `'0.06em'`). */
  authorLetterSpacing: z.string().optional(),
  /** Unitless line height for the author and role lines. */
  authorLineHeight: z.number().optional(),
  /** Quote color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Author / role color. Defaults to `--onda-dim`. */
  authorColor: z.string().default('#8E8E98'),
  /** Divider color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link QuoteCard}. */
export type QuoteCardProps = z.infer<typeof quoteCardSchema>;
