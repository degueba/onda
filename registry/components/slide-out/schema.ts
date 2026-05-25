import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link SlideOut} props. */
export const slideOutSchema = z.object({
  /** What to slide out. */
  text: z.string().default('Onda'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully leave. Defaults to `DURATION.fast` — exits are quicker than entrances. */
  duration: z.number().int().min(1).default(DURATION.fast),
  /** The direction the text leaves *toward*. `'up'` means it rises out of frame. */
  direction: z.enum(['up', 'down', 'left', 'right']).default('up'),
  /** Travel distance in px. Keep within the Onda envelope of 12–24. */
  distance: z.number().default(16),
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
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link SlideOut}. */
export type SlideOutProps = z.infer<typeof slideOutSchema>;
