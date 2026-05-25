import { z } from 'zod';

/** Zod schema for {@link clockWipe} options. */
export const clockWipeSchema = z.object({
  /** Canvas width in px — typically `useVideoConfig().width`. Required by Remotion's clock wipe. */
  width: z.number().int().positive(),
  /** Canvas height in px — typically `useVideoConfig().height`. */
  height: z.number().int().positive(),
});

export type ClockWipeOptions = z.input<typeof clockWipeSchema>;
