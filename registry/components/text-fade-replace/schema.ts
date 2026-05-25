import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link TextFadeReplace} props. */
export const textFadeReplaceSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('text-fade-replace').default('text-fade-replace'),
  /** The phrases to cycle through, in order. */
  phrases: z.array(z.string()).default(['ship', 'render', 'repeat']),
  /** Frames each phrase holds (including its crossfade out). */
  interval: z.number().int().min(1).default(45),
  /** Frames of crossfade between phrases. */
  crossfade: z.number().int().min(1).default(12),
  /** Frames before the first phrase appears. */
  delay: z.number().int().min(0).default(0),
  /** Loop back to the first phrase after the last. */
  loop: z.boolean().default(true),
  /** Text color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(96),
  /** Semantic typography role — canvas-aware pixels. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. */
  fontWeight: z.number().default(600),
  /** CSS letter-spacing. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. */
  lineHeight: z.number().default(1.1),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link TextFadeReplace}. */
export type TextFadeReplaceProps = z.infer<typeof textFadeReplaceSchema>;
