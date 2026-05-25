import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link DeviceFrame} props. */
export const deviceFrameSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('device-frame').default('device-frame'),
  /** Which device bezel to draw. */
  device: z.enum(['phone', 'laptop']).default('phone'),
  /** Optional screenshot/image URL shown inside when no children are passed. */
  src: z.string().optional(),
  /** Frames before the entrance. */
  delay: z.number().int().min(0).default(0),
  /** Scale-and-fade the device in on the house spring. */
  animate: z.boolean().default(true),
  /** Device width in px (height is derived from the device aspect). */
  width: z.number().default(420),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link DeviceFrame}. */
export type DeviceFrameProps = z.infer<typeof deviceFrameSchema>;
