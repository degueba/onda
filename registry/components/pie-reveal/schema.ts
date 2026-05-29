import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link PieReveal} props. */
export const pieRevealSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('pie-reveal').default('pie-reveal'),
  /** Percentage to reveal, 0–100. */
  value: z.number().min(0).max(100).default(64),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames until the arc has fully filled to `value`. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Arc radius in pixels. */
  radius: z.number().default(120),
  /** Stroke width of both the track and the arc, in pixels. */
  strokeWidth: z.number().default(12),
  /** Arc color. Defaults to `--onda-accent` (`#D96B82`). */
  accentColor: z.string().default('var(--onda-accent, #D96B82)'),
  /** Track (background ring) color. Defaults to `--onda-border-lit` (`#26262E`). */
  trackColor: z.string().default('var(--onda-border-lit, #26262E)'),
  /** Render the `value%` label in the center of the ring. */
  showValue: z.boolean().default(true),
  /** Color of the center `%` label. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Center label font size in pixels. */
  fontSize: z.number().default(56),
  /** Center label font family. The Onda display font by default. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link PieReveal}. */
export type PieRevealProps = z.infer<typeof pieRevealSchema>;
