import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link ProgressSteps} props. */
export const progressStepsSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('progress-steps').default('progress-steps'),
  /** Step labels, left to right. */
  steps: z.array(z.string()).default(['Plan', 'Build', 'Render', 'Ship']),
  /** How many steps are complete — the fill animates to this index (0-based count). */
  current: z.number().int().min(0).default(2),
  /** Frames before the fill animates. */
  delay: z.number().int().min(0).default(0),
  /** Frames for the fill to travel to `current`. */
  duration: z.number().int().min(1).default(DURATION.slower),
  /** Completed / active color — the earned accent. */
  accentColor: z.string().default('var(--onda-accent, #D96B82)'),
  /** Pending color. */
  dimColor: z.string().default('var(--onda-border-lit, #26262E)'),
  /** Label color. */
  labelColor: z.string().default('var(--onda-dim, #8E8E98)'),
  /** Font family for labels. */
  fontFamily: z.string().default('var(--onda-font-body, "Space Grotesk", sans-serif)'),
  /** Label font size in px. Sized for a 1080p+ video canvas. */
  fontSize: z.number().default(34),
  /** Overall width in px. */
  width: z.number().default(1280),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link ProgressSteps}. */
export type ProgressStepsProps = z.infer<typeof progressStepsSchema>;
