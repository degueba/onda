import { z } from 'zod';

/** Zod schema for {@link devicePullback} options. */
export const devicePullbackSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('device-pullback').default('device-pullback'),
  /** Which device bezel draws in around the content as it settles. */
  device: z.enum(['laptop', 'phone']).default('laptop'),
  /** Bezel / frame color — defaults to the Onda border tone. */
  frameColor: z.string().default('#1C1C22'),
  /** How far the content is scaled up before it pulls back to 1x. */
  startScale: z.number().min(1).max(4).default(2),
  /** Fill behind the device once it has pulled back into frame. */
  background: z.string().default('#08080A'),
});

export type DevicePullbackOptions = z.input<typeof devicePullbackSchema>;
