import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link Captions} props. */
export const captionsSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('captions').default('captions'),
  /**
   * The transcript timeline. Each entry is a word + its `[startMs, endMs)`
   * window — the format every STT / transcript tool already speaks.
   */
  captions: z
    .array(
      z.object({
        text: z.string(),
        startMs: z.number(),
        endMs: z.number(),
      }),
    )
    .default([
      { text: 'Onda', startMs: 0, endMs: 1500 },
      { text: 'kinetic', startMs: 1500, endMs: 3000 },
      { text: 'captions', startMs: 3000, endMs: 4500 },
    ]),
  /** Frames before the timeline starts (shifts every `startMs` by this). */
  delay: z.number().int().min(0).default(0),
  /** Inactive word color. Defaults to `--onda-dim`. */
  color: z.string().default('#8E8E98'),
  /** Active word color. Defaults to `--onda-text`. */
  accentColor: z.string().default('#F2F2F4'),
  /** Pixels. */
  fontSize: z.number().default(96),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Font weight (e.g. 500, 600). */
  fontWeight: z.number().default(600),
  /** CSS letter-spacing (e.g. `'-0.02em'`). Default `'normal'`. */
  letterSpacing: z.string().optional(),
  /** Unitless line height. Default `1.15` for caption stacks. */
  lineHeight: z.number().optional(),
  /** Text alignment of the caption block. */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link Captions}. */
export type CaptionsProps = z.infer<typeof captionsSchema>;
