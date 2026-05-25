import { z } from 'zod';

/** Zod schema for {@link chromaticAberration} options. */
export const chromaticAberrationSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('chromatic-aberration').default('chromatic-aberration'),
  /**
   * Peak channel-split in px at the cut. Outgoing splits from 0 to this as it
   * fades; incoming converges from this to 0 as it fades in.
   */
  intensity: z.number().min(0).max(60).default(24),
  /** Red-channel ghost color. */
  redColor: z.string().default('rgba(255,77,109,0.6)'),
  /** Cyan-channel ghost color. */
  cyanColor: z.string().default('rgba(77,226,255,0.6)'),
});

export type ChromaticAberrationOptions = z.input<typeof chromaticAberrationSchema>;
