import { z } from 'zod';

/** Zod schema for {@link push} options. */
export const pushSchema = z.object({
  /**
   * Which direction the entire frame translates. Both scenes move
   * together as a unit — reads as a camera pan between them.
   */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type PushOptions = z.input<typeof pushSchema>;
