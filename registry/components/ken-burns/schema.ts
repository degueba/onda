import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link KenBurns} props. */
export const kenBurnsSchema = z.object({
  /**
   * Image URL. The default is a stable Picsum seed so the playground render
   * is reproducible — supply your own `src` in real compositions.
   */
  src: z.string().default('https://picsum.photos/seed/onda/1920/1080'),
  /** Frames before the drift starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which the zoom + pan completes. 150f ≈ 5s @ 30fps. */
  duration: z.number().int().min(1).default(150),
  /** Starting scale. */
  fromScale: z.number().default(1.0),
  /** Ending scale. Keep the delta restrained (1.0 → 1.1). */
  toScale: z.number().default(1.1),
  /** Starting transform-origin X. `0` = left, `1` = right. */
  fromX: z.number().min(0).max(1).default(0.5),
  /** Starting transform-origin Y. `0` = top, `1` = bottom. */
  fromY: z.number().min(0).max(1).default(0.5),
  /** Ending transform-origin X. */
  toX: z.number().min(0).max(1).default(0.5),
  /** Ending transform-origin Y. */
  toY: z.number().min(0).max(1).default(0.5),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. When omitted, the component fills the entire canvas (default behavior). Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link KenBurns}. */
export type KenBurnsProps = z.infer<typeof kenBurnsSchema>;
