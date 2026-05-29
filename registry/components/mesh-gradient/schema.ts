import { z } from 'zod';

/** Zod schema for {@link MeshGradient} props. */
export const meshGradientSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('mesh-gradient').default('mesh-gradient'),
  /** Blob colors. 2–4 reads best; they drift over the `--onda-bg` canvas. */
  colors: z.array(z.string()).default(['var(--onda-accent, #D96B82)', 'var(--onda-accent-soft, #E89AAB)', 'var(--onda-border-lit, #26262E)']),
  /** Base canvas color behind the blobs. */
  background: z.string().default('var(--onda-bg, #08080A)'),
  /** Drift speed multiplier. Keep low — this is atmosphere, not motion. */
  speed: z.number().default(1),
  /** Seed for the blob phase offsets (deterministic). */
  seed: z.number().int().default(7),
  /** Overall blob opacity over the canvas. */
  opacity: z.number().min(0).max(1).default(0.5),
});

/** Inferred props for {@link MeshGradient}. */
export type MeshGradientProps = z.infer<typeof meshGradientSchema>;
