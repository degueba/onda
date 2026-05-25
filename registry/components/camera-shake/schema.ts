import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link CameraShake} props. */
export const cameraShakeSchema = z.object({
  /** What to wrap with the shake. Optional — a placeholder renders if omitted. */
  children: z.any().optional(),
  /** Frames before the shake starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames the shake lasts. Outside this window, offset is exactly 0. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Maximum offset in px. Restrained by default — bump for impact moments. */
  intensity: z.number().default(4),
  /** PRNG seed — same seed always produces the same shake. */
  seed: z.number().int().default(0),
  /** Linearly decay intensity to 0 over `duration`. */
  decay: z.boolean().default(true),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link CameraShake}. */
export type CameraShakeProps = z.infer<typeof cameraShakeSchema>;
