import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Marquee} props. */
export const marqueeSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('marquee').default('marquee'),
  /** Items to scroll. The list is rendered three times for seamless wrap. */
  items: z.array(z.string()).default([
    'REMOTION',
    'TYPESCRIPT',
    'REACT',
  ]),
  /** Scroll speed in pixels per second. Keep low for restraint. */
  speed: z.number().default(30),
  /** Scroll direction. */
  direction: z.enum(['left', 'right']).default('left'),
  /** Pixels between items. */
  gap: z.number().int().min(0).default(64),
  /** Text color. Defaults to `--onda-faint` — atmospheric, not headline. */
  color: z.string().default('#56565F'),
  /** Pixels. */
  fontSize: z.number().default(32),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the component fills the entire canvas (default behavior). Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Marquee}. */
export type MarqueeProps = z.infer<typeof marqueeSchema>;
