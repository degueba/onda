import { z } from 'zod';

/** Zod schema for {@link blur} options. */
export const blurSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('blur').default('blur'),
  /**
   * Max blur radius in px. Outgoing blurs from 0 to this value as it
   * fades; incoming blurs from this value to 0 as it fades in.
   * Default `10` matches the BlurReveal entrance fingerprint.
   */
  blurAmount: z.number().min(0).max(40).default(10),
});

export type BlurOptions = z.input<typeof blurSchema>;
