import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link ProgressBar} props. */
export const progressBarSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('progress-bar').default('progress-bar'),
  /** Target fill, 0–100. The bar grows from 0 to this value. */
  value: z.number().min(0).max(100).default(64),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to reach the full target value. Bars want more time than text. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Bar thickness in px. */
  height: z.number().default(12),
  /** Border-radius in px. Defaults to a full pill. */
  radius: z.number().default(999),
  /** Track color — the unfilled portion. Defaults to `--onda-border-lit`. */
  trackColor: z.string().default('#26262E'),
  /** Fill color — the earned accent. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Whether to render the `${value}%` label beside the bar. */
  showValue: z.boolean().default(true),
  /** Label color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Label font size in px. */
  fontSize: z.number().default(28),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link ProgressBar}. */
export type ProgressBarProps = z.infer<typeof progressBarSchema>;
