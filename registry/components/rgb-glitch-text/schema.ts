import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link RgbGlitchText} props. */
export const rgbGlitchTextSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('rgb-glitch-text').default('rgb-glitch-text'),
  /** The text to glitch. */
  text: z.string().default('GLITCH'),
  /** Frames before the effect starts. */
  delay: z.number().int().min(0).default(0),
  /** Constant baseline channel split in px (the always-on chromatic edge). */
  baseSplit: z.number().default(2),
  /** Peak extra split in px during a glitch burst. */
  intensity: z.number().default(10),
  /** Frames between glitch bursts. */
  glitchPeriod: z.number().int().min(1).default(48),
  /** Frames a glitch burst lasts. */
  glitchDuration: z.number().int().min(1).default(8),
  /** Seed for the (deterministic) burst jitter. */
  seed: z.number().int().default(7),
  /** Base (center) text color. Defaults to `--onda-text`. */
  color: z.string().default('var(--onda-text, #F2F2F4)'),
  /** Red-channel copy color. */
  redColor: z.string().default('#FF4D6D'),
  /** Cyan-channel copy color. */
  cyanColor: z.string().default('#4DE2FF'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(120),
  /** Semantic typography role — canvas-aware pixels. */
  size: sizeRoleSchema.optional(),
  /** Font family. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Font weight. */
  fontWeight: z.number().default(600),
  /** CSS letter-spacing. */
  letterSpacing: z.string().default('-0.02em'),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link RgbGlitchText}. */
export type RgbGlitchTextProps = z.infer<typeof rgbGlitchTextSchema>;
