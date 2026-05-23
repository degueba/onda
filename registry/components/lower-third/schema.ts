import { z } from 'zod';

export const lowerThirdSchema = z.object({
  name: z.string().default('Rodrigo'),
  role: z.string().default('CEO, Onda'),
  position: z.enum(['bottom-left', 'bottom-right']).default('bottom-left'),
  delay: z.number().int().min(0).default(0),               // frames before start
  accent: z.boolean().default(true),                       // show the underline
  color: z.string().default('#F2F2F4'),                    // --onda-text (name)
  roleColor: z.string().default('#8E8E98'),                // --onda-dim (role)
  accentColor: z.string().default('#D96B82'),              // --onda-accent (underline)
  fontSize: z.number().default(48),                        // name
  roleFontSize: z.number().default(22),                    // role
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;
