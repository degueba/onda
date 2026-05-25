import { z } from 'zod';

/** Zod schema for {@link dipToColor} options. */
export const dipToColorSchema = z.object({
  /**
   * Solid color to dip through. Default `#08080A` (Onda canvas bg) for
   * brand consistency. Pass `'#000'` for the editing-room classic
   * dip-to-black, or `'#fff'` for dip-to-white.
   */
  color: z.string().default('#08080A'),
});

export type DipToColorOptions = z.input<typeof dipToColorSchema>;
