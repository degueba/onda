import { z } from 'zod';

/** Zod schema for {@link dipToColor} options. */
export const dipToColorSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('dip-to-color').default('dip-to-color'),
  /**
   * Solid color to dip through. Default `#08080A` (Onda canvas bg) for
   * brand consistency. Pass `'#000'` for the editing-room classic
   * dip-to-black, or `'#fff'` for dip-to-white.
   */
  color: z.string().default('var(--onda-bg, #08080A)'),
});

export type DipToColorOptions = z.input<typeof dipToColorSchema>;
