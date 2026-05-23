import { z } from 'zod';

export const logoStingSchema = z.object({
  d: z.string().default('M 50 60 Q 100 20 150 60 T 250 60'),  // sample wave path — Onda the wave
  title: z.string().default('Onda'),
  delay: z.number().int().min(0).default(0),                  // frames before start
  accent: z.boolean().default(true),                          // show the accent underline
  viewBox: z.string().default('0 0 300 120'),                 // matches default d coord space
  pathWidth: z.number().default(400),                         // rendered width of the SVG stroke
  pathHeight: z.number().default(160),                        // rendered height of the SVG stroke
  strokeWidth: z.number().default(3),
  stroke: z.string().default('#F2F2F4'),                      // --onda-text (logo stroke)
  accentColor: z.string().default('#D96B82'),                 // --onda-accent (underline)
  titleFontSize: z.number().default(96),
  color: z.string().default('#F2F2F4'),                       // --onda-text (title)
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type LogoStingProps = z.infer<typeof logoStingSchema>;
