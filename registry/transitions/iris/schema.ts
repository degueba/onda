import { z } from 'zod';

/** Zod schema for {@link iris} options. */
export const irisSchema = z.object({
  /** Canvas width in px — typically `useVideoConfig().width`. Required by Remotion's iris. */
  width: z.number().int().positive(),
  /** Canvas height in px — typically `useVideoConfig().height`. */
  height: z.number().int().positive(),
});

export type IrisOptions = z.input<typeof irisSchema>;
