import { z } from 'zod';
import { DURATION, STAGGER } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link BarChart} props. */
export const barChartSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('bar-chart').default('bar-chart'),
  /** Bars to render. Order is preserved — top to bottom. */
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .default([
      { label: 'Remotion', value: 92 },
      { label: 'After Effects', value: 64 },
      { label: 'Lottie', value: 38 },
    ]),
  /** Value mapped to a full-width bar. Bars cap at 100% of the track. */
  max: z.number().default(100),
  /** Frames before the **first** bar starts. */
  delay: z.number().int().min(0).default(0),
  /** Per-bar grow duration. Bars want more time than text. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Frames between consecutive bars. Canonical Onda stagger is `4`. */
  stagger: z.number().int().min(0).default(STAGGER),
  /** Bar height in px. */
  barHeight: z.number().default(32),
  /** Pixel gap between rows. */
  gap: z.number().default(16),
  /** Color of the **largest** bar — the earned accent. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Color of non-largest bars. Defaults to `--onda-dim`. */
  barColor: z.string().default('#8E8E98'),
  /** Bar track color. Defaults to `--onda-border`. */
  trackColor: z.string().default('#1C1C22'),
  /** Label color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Pixels reserved for the label column. */
  labelWidth: z.number().default(220),
  /** Pixels. */
  fontSize: z.number().default(24),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link BarChart}. */
export type BarChartProps = z.infer<typeof barChartSchema>;
