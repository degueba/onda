import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link ScaleIn} props. */
export const scaleInSchema = z.object({
  /** What to reveal. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to settle. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Starting scale (settles to 1). Restrained: values below ~0.85 break the language. */
  fromScale: z.number().default(0.9),
  /** Text color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight. Display default `600`. */
  fontWeight: z.number().optional(),
  /** CSS letter-spacing (e.g. `'-0.02em'`, `'0.06em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.1` for tight display copy. */
  lineHeight: z.number().optional(),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** CSS text-transform. Useful for eyebrow / kicker copy. */
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  /** CSS text-shadow value (e.g. `'0 4px 24px rgba(0,0,0,0.55)'`). Useful for readability over busy backgrounds. */
  textShadow: z.string().optional(),
  /** CSS font-style. */
  fontStyle: z.enum(['normal', 'italic', 'oblique']).optional(),
  /** CSS text-wrap. `'balance'` evens out headline line-breaks; `'pretty'` polishes body text. */
  textWrap: z.enum(['wrap', 'nowrap', 'balance', 'pretty']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link ScaleIn}. */
export type ScaleInProps = z.infer<typeof scaleInSchema>;
