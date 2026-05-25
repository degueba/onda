import { z } from 'zod';

/** Zod schema for {@link GradientShift} props. */
export const gradientShiftSchema = z.object({
  /** Starting gradient color. Defaults to `--onda-surface`. */
  from: z.string().default('#0E0E12'),
  /** Ending gradient color. Defaults to `--onda-border`. */
  to: z.string().default('#1C1C22'),
  /** Starting angle in degrees. */
  angle: z.number().default(135),
  /** Rotation rate in degrees per frame. Keep low — atmospheric, not focal. */
  speed: z.number().default(0.5),
  /** Frames before the drift starts. */
  delay: z.number().int().min(0).default(0),
});

/** Inferred props for {@link GradientShift}. */
export type GradientShiftProps = z.infer<typeof gradientShiftSchema>;
