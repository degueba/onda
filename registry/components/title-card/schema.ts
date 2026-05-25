import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link TitleCard} props. */
export const titleCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('title-card').default('title-card'),
  /** Hero headline. */
  title: z.string().default('Onda'),
  /** Smaller phrase beneath the headline, cascaded word-by-word. */
  subtitle: z.string().default('premium motion graphics for Remotion'),
  /** Frames before the title starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent underline beneath the title. */
  accent: z.boolean().default(true),
  /** Title font size in px. Wins over `titleSize` if both are passed. */
  titleFontSize: z.number().default(160),
  /** Semantic role for the title — resolves to canvas-aware pixels. `titleFontSize` wins when both are passed. */
  titleSize: sizeRoleSchema.optional(),
  /** Font weight for the title. */
  titleFontWeight: z.number().optional(),
  /** CSS letter-spacing for the title (e.g. `'-0.02em'`). */
  titleLetterSpacing: z.string().optional(),
  /** Unitless line height for the title. */
  titleLineHeight: z.number().optional(),
  /** Subtitle font size in px. Wins over `subtitleSize` if both are passed. */
  subtitleFontSize: z.number().default(32),
  /** Semantic role for the subtitle — resolves to canvas-aware pixels. `subtitleFontSize` wins when both are passed. */
  subtitleSize: sizeRoleSchema.optional(),
  /** Font weight for the subtitle. */
  subtitleFontWeight: z.number().optional(),
  /** CSS letter-spacing for the subtitle (e.g. `'0.06em'`). */
  subtitleLetterSpacing: z.string().optional(),
  /** Unitless line height for the subtitle. */
  subtitleLineHeight: z.number().optional(),
  /** Title color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Subtitle color. Defaults to `--onda-dim`. */
  subtitleColor: z.string().default('#8E8E98'),
  /** Accent rule color. Defaults to `--onda-accent` — the earned-color moment. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Defaults to centered. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link TitleCard}. */
export type TitleCardProps = z.infer<typeof titleCardSchema>;
