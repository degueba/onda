import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link ShimmerSweep} props. */
export const shimmerSweepSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('shimmer-sweep').default('shimmer-sweep'),
  /** The text to sweep light across. */
  text: z.string().default('Onda'),
  /** Frames before the sweep starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames for one sweep pass. */
  duration: z.number().int().min(1).default(DURATION.slower),
  /** Loop the sweep instead of a single pass. */
  loop: z.boolean().default(false),
  /** Frames between sweeps when looping. */
  interval: z.number().int().min(1).default(60),
  /** Base text color. Defaults to `--onda-dim` so the bright band reads as a highlight. */
  color: z.string().default('#8E8E98'),
  /** The sweeping highlight color. Defaults to `--onda-text`. */
  shimmerColor: z.string().default('#F2F2F4'),
  /** Sweep angle in degrees. */
  angle: z.number().default(110),
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
  align: z.enum(['left', 'center', 'right']).default('left'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link ShimmerSweep}. */
export type ShimmerSweepProps = z.infer<typeof shimmerSweepSchema>;
