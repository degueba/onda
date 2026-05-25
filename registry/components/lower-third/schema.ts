import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for `LowerThird` props. */
export const lowerThirdSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('lower-third').default('lower-third'),
  /** The person's name. */
  name: z.string().default('Rodrigo'),
  /** The person's role / title. */
  role: z.string().default('CEO, Onda'),
  /** Where on the canvas the bar sits. Region (`'bottom-left'`, `'bottom-right'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Defaults to `'bottom-left'`. */
  placement: placementSchema.optional().default('bottom-left'),
  /** Frames before the name slides in. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent underline beneath the name. */
  accent: z.boolean().default(true),
  /** Name color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Role color. Defaults to `--onda-dim`. */
  roleColor: z.string().default('#8E8E98'),
  /** Underline color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Name font size in px. Wins over `nameSize` if both are passed. */
  fontSize: z.number().default(48),
  /** Semantic role for the name — resolves to canvas-aware pixels. `fontSize` wins when both are passed. */
  nameSize: sizeRoleSchema.optional(),
  /** Font weight for the name. */
  nameFontWeight: z.number().optional(),
  /** CSS letter-spacing for the name (e.g. `'-0.02em'`). */
  nameLetterSpacing: z.string().optional(),
  /** Unitless line height for the name. */
  nameLineHeight: z.number().optional(),
  /** Role font size in px. Wins over `roleSize` if both are passed. */
  roleFontSize: z.number().default(22),
  /** Semantic role for the role line — resolves to canvas-aware pixels. `roleFontSize` wins when both are passed. */
  roleSize: sizeRoleSchema.optional(),
  /** Font weight for the role. */
  roleFontWeight: z.number().optional(),
  /** CSS letter-spacing for the role (e.g. `'0.06em'`). */
  roleLetterSpacing: z.string().optional(),
  /** Unitless line height for the role. */
  roleLineHeight: z.number().optional(),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for `LowerThird`. */
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;
