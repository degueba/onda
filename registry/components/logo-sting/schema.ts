import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for `LogoSting` props. */
export const logoStingSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('logo-sting').default('logo-sting'),
  /** SVG path `d` for the logo mark. The default is a sample wave. */
  d: z.string().default('M 50 60 Q 100 20 150 60 T 250 60'),
  /** The brand / product title beneath the mark. */
  title: z.string().default('Onda'),
  /** Frames before the stroke starts drawing. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent rule beneath the title. */
  accent: z.boolean().default(true),
  /** SVG viewBox — must match the coordinate space of `d`. */
  viewBox: z.string().default('0 0 300 120'),
  /** Rendered width of the SVG stroke in px. */
  pathWidth: z.number().default(400),
  /** Rendered height of the SVG stroke in px. */
  pathHeight: z.number().default(160),
  /** Stroke width in path coordinate units. */
  strokeWidth: z.number().default(3),
  /** Logo stroke color. Defaults to `--onda-text`. */
  stroke: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Underline accent color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('var(--onda-accent, #D96B82)'),
  /** Title font size in px. */
  titleFontSize: z.number().default(96),
  /** Title color. Defaults to `--onda-text`. */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Onda display font. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the component fills the entire canvas (default behavior). Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for `LogoSting`. */
export type LogoStingProps = z.infer<typeof logoStingSchema>;
