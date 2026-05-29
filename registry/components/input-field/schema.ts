import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link InputField} props. */
export const inputFieldSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('input-field').default('input-field'),
  /** The field's value. With `typed` on, this is what types itself in. */
  value: z.string().default('hello@onda.video'),
  /** Placeholder shown while the field is empty. */
  placeholder: z.string().default('Enter your email'),
  /** Label above the field. Empty hides it. */
  label: z.string().default('Email'),
  /** Animate `value` typing itself in character by character (via `useTextReveal`). */
  typed: z.boolean().default(true),
  /** Frames before typing starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to type the whole value. */
  typeDuration: z.number().int().min(1).default(36),
  /** Show the accent focus ring around the field. */
  focusRing: z.boolean().default(true),
  /** Field width in px. Sized for a 1080p+ video canvas, not a screen UI. */
  width: z.number().default(640),
  /** Text size in px. Wins over `size` if both are passed. */
  fontSize: z.number().default(36),
  /** Semantic role for the text — resolves to canvas-aware pixels. `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** UI font stack. */
  fontFamily: z.string().default('var(--onda-font-body, "Space Grotesk", sans-serif)'),
  /** Value text color. */
  textColor: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Placeholder text color. */
  placeholderColor: z.string().default('var(--onda-faint, #56565F)'),
  /** Label text color. */
  labelColor: z.string().default('var(--onda-dim, #8E8E98)'),
  /** Caret + focus-ring color — the earned accent. */
  accentColor: z.string().default('var(--onda-accent, #D96B82)'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link InputField}. */
export type InputFieldProps = z.infer<typeof inputFieldSchema>;
