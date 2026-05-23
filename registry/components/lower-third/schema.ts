import { z } from 'zod';

/** Zod schema for `LowerThird` props. */
export const lowerThirdSchema = z.object({
  /** The person's name. */
  name: z.string().default('Rodrigo'),
  /** The person's role / title. */
  role: z.string().default('CEO, Onda'),
  /** Which corner of the canvas the bar sits in. */
  position: z.enum(['bottom-left', 'bottom-right']).default('bottom-left'),
  /** Frames before the name slides in. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent underline beneath the name. */
  accent: z.boolean().default(true),
  /** Name color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Role color. Defaults to `--onda-dim`. */
  roleColor: z.string().default('#8E8E98'),
  /** Underline color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Name font size in px. */
  fontSize: z.number().default(48),
  /** Role font size in px. */
  roleFontSize: z.number().default(22),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for `LowerThird`. */
export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;
