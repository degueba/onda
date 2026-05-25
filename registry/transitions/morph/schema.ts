import { z } from 'zod';

/** Zod schema for {@link morph} options. */
export const morphSchema = z.object({
  /**
   * Maximum scale delta around 1.0. Default `0.04` — outgoing scales
   * 1 → 1.04, incoming scales 0.96 → 1. Small by design; the point is
   * to feel cinematic, not loud.
   */
  scaleAmount: z.number().min(0).max(0.2).default(0.04),
});

export type MorphOptions = z.input<typeof morphSchema>;
