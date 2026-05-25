import { z } from 'zod';

/** Zod schema for {@link iris} options. */
export const irisSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('iris').default('iris'),
  /** Canvas width in px — typically `useVideoConfig().width`. Required by Remotion's iris. */
  width: z.number().int().positive(),
  /** Canvas height in px — typically `useVideoConfig().height`. */
  height: z.number().int().positive(),
});

export type IrisOptions = z.input<typeof irisSchema>;
