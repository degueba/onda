import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link StatCard} props. */
export const statCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('stat-card').default('stat-card'),
  /** The headline number to count up to. */
  value: z.number().default(1247),
  /** Qualifier beneath the number — cascaded word-by-word. */
  label: z.string().default('creators this week'),
  /** Prepended to the number (e.g. `'$'`). */
  prefix: z.string().default(''),
  /** Appended to the number (e.g. `'%'`). */
  suffix: z.string().default(''),
  /** Frames before the count starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent rule beneath the label. */
  accent: z.boolean().default(true),
  /** Number font size in px. Wins over `numberSize` if both are passed. */
  numberFontSize: z.number().default(200),
  /** Semantic role for the number — resolves to canvas-aware pixels. `numberFontSize` wins when both are passed. */
  numberSize: sizeRoleSchema.optional(),
  /** Font weight for the number. */
  numberFontWeight: z.number().optional(),
  /** CSS letter-spacing for the number (e.g. `'-0.02em'`). */
  numberLetterSpacing: z.string().optional(),
  /** Unitless line height for the number. */
  numberLineHeight: z.number().optional(),
  /** Label font size in px. Wins over `labelSize` if both are passed. */
  labelFontSize: z.number().default(28),
  /** Semantic role for the label — resolves to canvas-aware pixels. `labelFontSize` wins when both are passed. */
  labelSize: sizeRoleSchema.optional(),
  /** Font weight for the label. */
  labelFontWeight: z.number().optional(),
  /** CSS letter-spacing for the label (e.g. `'0.06em'`). */
  labelLetterSpacing: z.string().optional(),
  /** Unitless line height for the label. */
  labelLineHeight: z.number().optional(),
  /** Number color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Label color. Defaults to `--onda-dim`. */
  labelColor: z.string().default('#8E8E98'),
  /** Accent rule color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link StatCard}. */
export type StatCardProps = z.infer<typeof statCardSchema>;
