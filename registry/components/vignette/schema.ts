import { z } from 'zod';

/** Zod schema for {@link Vignette} props. */
export const vignetteSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('vignette').default('vignette'),
  /** Edge darkness. `0` = no vignette, `1` = fully dark edges. */
  intensity: z.number().min(0).max(1).default(0.5),
  /** Percent from center where the darkening begins. Larger = bigger clean middle. */
  innerRadius: z.number().min(0).max(100).default(40),
  /** Edge color. Defaults to pure black for the classic cinematic frame. */
  color: z.string().default('#000000'),
});

/** Inferred props for {@link Vignette}. */
export type VignetteProps = z.infer<typeof vignetteSchema>;
