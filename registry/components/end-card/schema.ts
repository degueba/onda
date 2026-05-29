import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link EndCard} props. */
export const endCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('end-card').default('end-card'),
  /** Hero CTA line. */
  cta: z.string().default('Made with Onda'),
  /** Social handles or URLs displayed in a row beneath the CTA. */
  handles: z.array(z.string()).default(['@onda.video', 'onda.video/components']),
  /** Frames before the CTA starts. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent underline beneath the CTA. */
  accent: z.boolean().default(true),
  /** CTA font size in px. Wins over `ctaSize` if both are passed. */
  ctaFontSize: z.number().default(96),
  /** Semantic role for the CTA — resolves to canvas-aware pixels. `ctaFontSize` wins when both are passed. */
  ctaSize: sizeRoleSchema.optional(),
  /** Font weight for the CTA. */
  ctaFontWeight: z.number().optional(),
  /** CSS letter-spacing for the CTA (e.g. `'-0.02em'`). */
  ctaLetterSpacing: z.string().optional(),
  /** Unitless line height for the CTA. */
  ctaLineHeight: z.number().optional(),
  /** Handles row font size in px. Wins over `handlesSize` if both are passed. */
  handlesFontSize: z.number().default(24),
  /** Semantic role for the handles row — resolves to canvas-aware pixels. `handlesFontSize` wins when both are passed. */
  handlesSize: sizeRoleSchema.optional(),
  /** Font weight for the handles row. */
  handlesFontWeight: z.number().optional(),
  /** CSS letter-spacing for the handles row (e.g. `'0.06em'`). */
  handlesLetterSpacing: z.string().optional(),
  /** Unitless line height for the handles row. */
  handlesLineHeight: z.number().optional(),
  /** CTA color. Defaults to `--onda-text`. */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Handles color. Defaults to `--onda-faint`. */
  handlesColor: z.string().default('var(--onda-faint, #56565F)'),
  /** Underline color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('var(--onda-accent, #D96B82)'),
  /** Onda display font. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link EndCard}. */
export type EndCardProps = z.infer<typeof endCardSchema>;
