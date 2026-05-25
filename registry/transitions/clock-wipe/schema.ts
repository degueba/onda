import { z } from 'zod';

/** Zod schema for {@link clockWipe} options. */
export const clockWipeSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('clock-wipe').default('clock-wipe'),
  /** Canvas width in px — typically `useVideoConfig().width`. Required by Remotion's clock wipe. */
  width: z.number().int().positive(),
  /** Canvas height in px — typically `useVideoConfig().height`. */
  height: z.number().int().positive(),
});

export type ClockWipeOptions = z.input<typeof clockWipeSchema>;
