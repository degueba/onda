import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link TrackingIn} props. */
export const trackingInSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('tracking-in').default('tracking-in'),
  /** The text to settle in. */
  text: z.string().default('Onda'),
  /** Frames before the entrance starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames until the text settles. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Text color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Starting letter-spacing in em — the text begins spread wide and contracts. */
  fromTracking: z.number().default(0.5),
  /** Resting letter-spacing in em. */
  tracking: z.number().default(-0.02),
  /** Start the text slightly blurred and sharpen as it settles. */
  blur: z.boolean().default(true),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(96),
  /** Semantic typography role — canvas-aware pixels. */
  size: sizeRoleSchema.optional(),
  /** Onda display font. Never default to Inter / Arial / system. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. */
  fontWeight: z.number().default(600),
  /** Unitless line height. */
  lineHeight: z.number().default(1.1),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link TrackingIn}. */
export type TrackingInProps = z.infer<typeof trackingInSchema>;
