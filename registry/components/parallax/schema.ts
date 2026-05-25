import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Parallax} props. */
export const parallaxSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('parallax').default('parallax'),
  /**
   * Image URL. The default is a stable Picsum seed so the playground render
   * is reproducible — supply your own `src` in real compositions.
   */
  src: z.string().default('https://picsum.photos/seed/onda-parallax/1920/1080'),
  /** Frames before the drift starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which the drift completes. 180f ≈ 6s @ 30fps — parallax wants time. */
  duration: z.number().int().min(1).default(180),
  /** Drift direction. The image moves *toward* this edge as time advances. */
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  /** Total drift distance in pixels across `duration`. Keep restrained. */
  distance: z.number().default(40),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the component fills the entire canvas (default behavior). Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Parallax}. */
export type ParallaxProps = z.infer<typeof parallaxSchema>;
