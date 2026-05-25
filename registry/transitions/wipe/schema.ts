import { z } from 'zod';

/** Zod schema for {@link wipe} options. */
export const wipeSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('wipe').default('wipe'),
  /** Which direction the wipe travels across the screen. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type WipeOptions = z.input<typeof wipeSchema>;
