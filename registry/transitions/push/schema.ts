import { z } from 'zod';

/** Zod schema for {@link push} options. */
export const pushSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('push').default('push'),
  /**
   * Which direction the entire frame translates. Both scenes move
   * together as a unit — reads as a camera pan between them.
   */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type PushOptions = z.input<typeof pushSchema>;
