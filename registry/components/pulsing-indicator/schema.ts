import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link PulsingIndicator} props. */
export const pulsingIndicatorSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('pulsing-indicator').default('pulsing-indicator'),
  /** Dot + ring color. The earned accent by default. */
  color: z.string().default('#D96B82'),
  /** Dot diameter in px. */
  size: z.number().default(20),
  /** Optional label to the right of the dot. Empty hides it. */
  label: z.string().default('LIVE'),
  /** Label color. */
  labelColor: z.string().default('#8E8E98'),
  /** Label font family. */
  fontFamily: z.string().default('"Space Grotesk", sans-serif'),
  /** Label font size in px. */
  fontSize: z.number().default(28),
  /** Frames per pulse cycle. */
  period: z.number().int().min(1).default(45),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link PulsingIndicator}. */
export type PulsingIndicatorProps = z.infer<typeof pulsingIndicatorSchema>;
