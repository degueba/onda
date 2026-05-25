import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link LineChart} props. */
export const lineChartSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('line-chart').default('line-chart'),
  /** The series values, left to right. */
  data: z.array(z.number()).default([12, 18, 15, 24, 22, 31, 28, 38]),
  /** Frames before the line starts drawing. */
  delay: z.number().int().min(0).default(0),
  /** Frames for the line to fully draw on. */
  duration: z.number().int().min(1).default(40),
  /** Line + dot color. The earned accent. */
  color: z.string().default('#D96B82'),
  /** Stroke width in px. */
  strokeWidth: z.number().default(4),
  /** Chart width in px. */
  width: z.number().default(900),
  /** Chart height in px. */
  height: z.number().default(440),
  /** Fill a soft gradient area under the line. */
  fill: z.boolean().default(true),
  /** Show a dot at each data point as the line reaches it. */
  showDots: z.boolean().default(true),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link LineChart}. */
export type LineChartProps = z.infer<typeof lineChartSchema>;
