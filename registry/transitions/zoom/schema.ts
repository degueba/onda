import { z } from 'zod';

/** Zod schema for {@link zoom} options. */
export const zoomSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('zoom').default('zoom'),
  /**
   * Direction of the zoom:
   * - `'in'` — incoming scene zooms toward the viewer (outgoing scales
   *   up out of frame, incoming arrives from slightly larger).
   * - `'out'` — incoming scene appears to pull away (outgoing shrinks
   *   inward, incoming arrives from slightly smaller).
   */
  direction: z.enum(['in', 'out']).default('in'),
  /**
   * Maximum scale delta. Default `0.2` — the catalog's "accent"
   * transition, used sparingly. Smaller values read closer to `morph`;
   * larger values lean into "punch."
   */
  scaleAmount: z.number().min(0.05).max(0.5).default(0.2),
});

export type ZoomOptions = z.input<typeof zoomSchema>;
