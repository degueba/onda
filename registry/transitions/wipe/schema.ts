import { z } from 'zod';

/** Zod schema for {@link wipe} options. */
export const wipeSchema = z.object({
  /** Which direction the wipe travels across the screen. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
});

export type WipeOptions = z.input<typeof wipeSchema>;
