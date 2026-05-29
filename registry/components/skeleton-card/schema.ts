import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link SkeletonCard} props. */
export const skeletonCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('skeleton-card').default('skeleton-card'),
  /** Number of text bars below the (optional) thumbnail. */
  lines: z.number().int().min(1).default(3),
  /** Show the leading avatar / thumbnail block above the bars. */
  thumbnail: z.boolean().default(true),
  /** Frames for one shimmer pass across the card. Lower = faster sweep. */
  shimmerSpeed: z.number().int().min(1).default(48),
  /** The travelling highlight color — a soft sheen over the bars. Defaults to `--onda-border-lit`. */
  shimmerColor: z.string().default('var(--onda-border-lit, #26262E)'),
  /** Resting fill of the placeholder bars / thumbnail. Defaults to `--onda-surface-2`. */
  barColor: z.string().default('var(--onda-surface-2, #121217)'),
  /** Frames before the card enters. */
  delay: z.number().int().min(0).default(0),
  /** Card width in px. */
  width: z.number().default(480),
  /** Card height in px. `undefined` lets the card size to its content. */
  height: z.number().optional(),
  /** Semantic role for the bar scale — resolves to canvas-aware pixels for the base bar height. Overrides the default bar height when set. */
  size: sizeRoleSchema.optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link SkeletonCard}. */
export type SkeletonCardProps = z.infer<typeof skeletonCardSchema>;
