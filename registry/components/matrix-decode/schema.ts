import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link MatrixDecode} props. */
export const matrixDecodeSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('matrix-decode').default('matrix-decode'),
  /** The text that decodes into place. */
  text: z.string().default('ONDA'),
  /** Frames before decoding starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames between successive characters settling (left-to-right). */
  charDelay: z.number().int().min(0).default(3),
  /** Frames each character scrambles before it settles. */
  scrambleDuration: z.number().int().min(1).default(18),
  /** Frames between glyph swaps while scrambling. Lower = faster flicker. */
  scrambleSpeed: z.number().int().min(1).default(2),
  /** Seed for the (deterministic) glyph picks. */
  seed: z.number().int().default(7),
  /** Glyph pool drawn from while scrambling. */
  charset: z.string().default('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/'),
  /** Settled text color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Color of still-scrambling glyphs — the earned accent. */
  scrambleColor: z.string().default('#D96B82'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(120),
  /** Semantic typography role — canvas-aware pixels. */
  size: sizeRoleSchema.optional(),
  /** Monospace stack keeps the width steady as glyphs flicker. */
  fontFamily: z.string().default('"Space Grotesk", ui-monospace, monospace'),
  /** Font weight. */
  fontWeight: z.number().default(600),
  /** CSS letter-spacing. */
  letterSpacing: z.string().default('0.06em'),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link MatrixDecode}. */
export type MatrixDecodeProps = z.infer<typeof matrixDecodeSchema>;
