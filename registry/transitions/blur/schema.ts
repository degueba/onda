import { z } from 'zod';

/** Zod schema for {@link blur} options. */
export const blurSchema = z.object({
  /**
   * Max blur radius in px. Outgoing blurs from 0 to this value as it
   * fades; incoming blurs from this value to 0 as it fades in.
   * Default `10` matches the BlurReveal entrance fingerprint.
   */
  blurAmount: z.number().min(0).max(40).default(10),
});

export type BlurOptions = z.input<typeof blurSchema>;
