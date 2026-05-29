import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Button} props. */
export const buttonSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('button').default('button'),
  /** The button label. */
  label: z.string().default('Get started'),
  /** `'primary'` = accent fill, `'ghost'` = transparent with a bordered outline. */
  variant: z.enum(['primary', 'ghost']).default('primary'),
  /** The earned accent — drives the primary fill and the ghost border/text tint. */
  accent: z.string().default('var(--onda-accent, #D96B82)'),
  /** Play the click-dip press animation. */
  press: z.boolean().default(true),
  /** Frame the press dip lands on (relative to the component's local timeline). */
  pressFrame: z.number().int().min(0).default(30),
  /** Frames before the button fades and rises in. */
  delay: z.number().int().min(0).default(0),
  /** Button width in px. Omit for auto width that hugs the label. */
  width: z.number().optional(),
  /** Label font size in px. Wins over `size` when both are passed. */
  fontSize: z.number().default(24),
  /** Semantic role for the label — resolves to canvas-aware pixels. `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Where on the canvas this sits. Region (`'center'`, `'lower-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Defaults to centered. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Button}. */
export type ButtonProps = z.infer<typeof buttonSchema>;
