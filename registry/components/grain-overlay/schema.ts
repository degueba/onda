import { z } from 'zod';

/** Zod schema for {@link GrainOverlay} props. */
export const grainOverlaySchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('grain-overlay').default('grain-overlay'),
  /** Layer opacity. Capped at `0.15` — CLAUDE.md tokens say ~2%. */
  opacity: z.number().min(0).max(0.15).default(0.04),
  /** SVG turbulence base frequency. Higher = finer grain. */
  baseFrequency: z.number().min(0).default(0.9),
  /** Noise complexity. */
  numOctaves: z.number().int().min(1).max(4).default(1),
  /** Deterministic noise variation — same seed always produces the same grain. */
  seed: z.number().int().min(0).default(0),
});

/** Inferred props for {@link GrainOverlay}. */
export type GrainOverlayProps = z.infer<typeof grainOverlaySchema>;
