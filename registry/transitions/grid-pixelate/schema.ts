import { z } from 'zod';

/** Zod schema for {@link gridPixelate} options. */
export const gridPixelateSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('grid-pixelate').default('grid-pixelate'),
  /** Number of cell columns. */
  cols: z.number().int().min(2).max(80).default(24),
  /** Number of cell rows. */
  rows: z.number().int().min(2).max(60).default(14),
  /** Seed for the (deterministic) cell reveal order. */
  seed: z.number().int().default(7),
  /** Cell fill while covering — match your canvas color. */
  color: z.string().default('var(--onda-bg, #08080A)'),
});

export type GridPixelateOptions = z.input<typeof gridPixelateSchema>;
