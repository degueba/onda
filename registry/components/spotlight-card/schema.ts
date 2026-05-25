import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link SpotlightCard} props. */
export const spotlightCardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('spotlight-card').default('spotlight-card'),
  /** Small uppercase kicker above the title. Empty hides it. */
  eyebrow: z.string().default('FEATURE'),
  /** Card headline (display font). */
  title: z.string().default('Motion identity'),
  /** Supporting body copy. Empty hides it. */
  body: z.string().default('One consistent feel across every component.'),
  /** Frames before the card enters. */
  delay: z.number().int().min(0).default(0),
  /** The drifting spotlight color — the earned accent. */
  glowColor: z.string().default('#D96B82'),
  /** Card width in px. */
  width: z.number().default(560),
  /** Inner padding in px. */
  padding: z.number().default(48),
  /** Text alignment. */
  align: z.enum(['left', 'center']).default('left'),
  /** Display font for the title. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link SpotlightCard}. */
export type SpotlightCardProps = z.infer<typeof spotlightCardSchema>;
