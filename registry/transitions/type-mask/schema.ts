import { z } from 'zod';

/** Zod schema for {@link typeMask} options. */
export const typeMaskSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('type-mask').default('type-mask'),
  /** The word held then blown up to mask the cut. Short, bold words read best. */
  text: z.string().default('NEXT'),
  /** Portion of the transition (0–1) the type holds at rest before it scales. */
  holdFrames: z.number().min(0).max(0.9).default(0.35),
  /** How large the type scales by the end — large enough to push every letterform past the edges. */
  maxScale: z.number().min(2).max(60).default(22),
  /** Fill of the masking type. Match your canvas so the held word reads as solid. */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Type family for the mask word. Default Clash Display — boldest weight for the widest interior space. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
});

export type TypeMaskOptions = z.input<typeof typeMaskSchema>;
