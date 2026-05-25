import { z } from 'zod';

/** Zod schema for {@link flip} options. */
export const flipSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('flip').default('flip'),
  /** Which way the flip rotates. `'left'` flips the scene around like a card revealing the new face from the right edge. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /**
   * Perspective in pixels — distance of the implicit "camera" from the
   * flipping plane. Lower = more dramatic 3D, higher = subtler.
   * Default `1000` matches Remotion's default.
   */
  perspective: z.number().positive().default(1000),
});

export type FlipOptions = z.input<typeof flipSchema>;
