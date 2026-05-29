import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link ChapterCard} props. */
export const chapterCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('chapter-card').default('chapter-card'),
  /** The chapter heading — the focal text on the card. */
  chapter: z.string().default('The setup'),
  /** Numbered index displayed above the chapter. String so leading zeros (`"01"`) read as intended. */
  number: z.string().default('01'),
  /** Frames before the number starts fading in. The whole card is sequenced relative to this. */
  delay: z.number().int().min(0).default(0),
  /** When `true`, the number renders in `numberColor` (the rose) and a quiet underline punctuates the title. */
  accent: z.boolean().default(true),
  /** Number color when `accent` is `true`. Defaults to `--onda-accent`. */
  numberColor: z.string().default('var(--onda-accent, #D96B82)'),
  /** Chapter title color. Defaults to `--onda-text`. */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Number color when `accent` is `false`. Defaults to `--onda-dim` so the number reads as quiet metadata. */
  subtitleColor: z.string().default('var(--onda-dim, #8E8E98)'),
  /** Number font size in px — smaller than the title, sitting above it. Wins over `numberSize` if both are passed. */
  numberFontSize: z.number().default(32),
  /** Semantic role for the number — resolves to canvas-aware pixels. `numberFontSize` wins when both are passed. */
  numberSize: sizeRoleSchema.optional(),
  /** Font weight for the number. */
  numberFontWeight: z.number().optional(),
  /** CSS letter-spacing for the number (e.g. `'0.16em'`). */
  numberLetterSpacing: z.string().optional(),
  /** Unitless line height for the number. */
  numberLineHeight: z.number().optional(),
  /** Chapter title font size in px — the focal element on the card. Wins over `titleSize` if both are passed. */
  titleFontSize: z.number().default(96),
  /** Semantic role for the title — resolves to canvas-aware pixels. `titleFontSize` wins when both are passed. */
  titleSize: sizeRoleSchema.optional(),
  /** Font weight for the title. */
  titleFontWeight: z.number().optional(),
  /** CSS letter-spacing for the title (e.g. `'-0.02em'`). */
  titleLetterSpacing: z.string().optional(),
  /** Unitless line height for the title. */
  titleLineHeight: z.number().optional(),
  /** Onda display font. Applied to both number and title for tonal consistency. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link ChapterCard}. */
export type ChapterCardProps = z.infer<typeof chapterCardSchema>;
