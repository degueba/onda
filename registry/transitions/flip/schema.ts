import { z } from 'zod';

/** Zod schema for {@link flip} options. */
export const flipSchema = z.object({
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
