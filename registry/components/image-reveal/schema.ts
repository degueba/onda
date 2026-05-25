import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link ImageReveal} props. */
export const imageRevealSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('image-reveal').default('image-reveal'),
  /**
   * Image URL or path. The default is a stable Picsum seed so the playground
   * render is reproducible — supply your own `src` in real compositions.
   */
  src: z.string().default('https://picsum.photos/seed/onda-image-reveal/1920/1080'),
  /** Accessible alt text. */
  alt: z.string().default(''),
  /** Frames before the reveal starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to fully reveal. */
  duration: z.number().int().min(1).default(DURATION.base),
  /**
   * Which Onda motion fingerprint the entrance uses.
   * - `'blur'` — opacity + blur falloff + 16px rise (the BlurReveal fingerprint, for images).
   * - `'fade'` — opacity only.
   * - `'scale'` — opacity + subtle scale 0.95 → 1, no overshoot.
   */
  motion: z.enum(['blur', 'fade', 'scale']).default('blur'),
  /** How the image fits its box (`'cover'` crops to fill; `'contain'` letterboxes). */
  fit: z.enum(['cover', 'contain']).default('cover'),
  /**
   * Where on the canvas the image sits. Region (`'center'`, `'upper-third'`, ...)
   * or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the image
   * fills the entire canvas (matches `KenBurns` / `Parallax` defaults).
   */
  placement: placementSchema.optional(),
  /** Explicit width in px. When omitted, the image fills its container. */
  width: z.number().optional(),
  /** Explicit height in px. When omitted, the image fills its container. */
  height: z.number().optional(),
  /** Border radius in px. */
  borderRadius: z.number().default(0),
});

/** Inferred props for {@link ImageReveal}. */
export type ImageRevealProps = z.infer<typeof imageRevealSchema>;
