import { z } from 'zod';

/** Zod schema for {@link DynamicGrid} props. */
export const dynamicGridSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('dynamic-grid').default('dynamic-grid'),
  /** Cell size in px. */
  cell: z.number().int().min(4).default(48),
  /** Ruled lines or a dot lattice. */
  variant: z.enum(['lines', 'dots']).default('lines'),
  /** Grid color. Defaults to `--onda-border`. */
  color: z.string().default('#1C1C22'),
  /** Scroll speed in px/frame (diagonal drift). */
  speed: z.number().default(0.4),
  /** Grid opacity. */
  opacity: z.number().min(0).max(1).default(0.6),
  /** Add a centered accent glow over the grid. */
  glow: z.boolean().default(true),
  /** Glow color. Defaults to `--onda-accent`. */
  glowColor: z.string().default('#D96B82'),
  /** Canvas color behind the grid. */
  background: z.string().default('#08080A'),
});

/** Inferred props for {@link DynamicGrid}. */
export type DynamicGridProps = z.infer<typeof dynamicGridSchema>;
