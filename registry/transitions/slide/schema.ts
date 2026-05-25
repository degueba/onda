import { z } from 'zod';

/** Zod schema for {@link slide} options. */
export const slideSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('slide').default('slide'),
  /**
   * Which direction the incoming scene slides toward.
   * - `'left'` — both scenes appear to move leftward (new scene from the right)
   * - `'right'` — both appear to move rightward (new from the left)
   * - `'up'` — both move upward (new from below)
   * - `'down'` — both move downward (new from above)
   */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type SlideOptions = z.input<typeof slideSchema>;
