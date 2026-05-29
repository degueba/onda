import { z } from 'zod';
import { DURATION } from '../../../lib/motion';

/** Zod schema for {@link Spotlight} props — drives Remotion `defaultProps` validation. */
export const spotlightSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('spotlight').default('spotlight'),
  /** Horizontal centre of the spotlight as a 0–1 fraction of canvas width. */
  x: z.number().min(0).max(1).default(0.5),
  /** Vertical centre of the spotlight as a 0–1 fraction of canvas height. */
  y: z.number().min(0).max(1).default(0.5),
  /** Final radius as a percentage of the canvas's smaller dimension. */
  radius: z.number().min(0).default(40),
  /** Frames before the reveal starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames until the spotlight reaches its full radius. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** Light colour. Defaults to `--onda-text`. */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Gradient softness — % of the radius given over to the fade-to-transparent tail. */
  softness: z.number().min(0).max(100).default(60),
});

/** Inferred props for {@link Spotlight}. */
export type SpotlightProps = z.infer<typeof spotlightSchema>;
