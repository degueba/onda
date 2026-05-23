import { z } from 'zod';

/** Zod schema for `LogoSting` props. */
export const logoStingSchema = z.object({
  /** SVG path `d` for the logo mark. The default is a sample wave. */
  d: z.string().default('M 50 60 Q 100 20 150 60 T 250 60'),
  /** The brand / product title beneath the mark. */
  title: z.string().default('Onda'),
  /** Frames before the stroke starts drawing. */
  delay: z.number().int().min(0).default(0),
  /** Show the accent rule beneath the title. */
  accent: z.boolean().default(true),
  /** SVG viewBox — must match the coordinate space of `d`. */
  viewBox: z.string().default('0 0 300 120'),
  /** Rendered width of the SVG stroke in px. */
  pathWidth: z.number().default(400),
  /** Rendered height of the SVG stroke in px. */
  pathHeight: z.number().default(160),
  /** Stroke width in path coordinate units. */
  strokeWidth: z.number().default(3),
  /** Logo stroke color. Defaults to `--onda-text`. */
  stroke: z.string().default('#F2F2F4'),
  /** Underline accent color. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Title font size in px. */
  titleFontSize: z.number().default(96),
  /** Title color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for `LogoSting`. */
export type LogoStingProps = z.infer<typeof logoStingSchema>;
