import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link SlotMachineRoll} props. */
export const slotMachineRollSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('slot-machine-roll').default('slot-machine-roll'),
  /** The text that rolls into place. */
  text: z.string().default('2026'),
  /** Frames before rolling starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames between successive characters starting their roll. */
  charDelay: z.number().int().min(0).default(4),
  /** Frames for each character's reel to settle. */
  duration: z.number().int().min(1).default(DURATION.slow),
  /** How many filler glyphs spin past before the target lands. */
  reelLength: z.number().int().min(1).default(12),
  /** Seed for the (deterministic) filler glyphs. */
  seed: z.number().int().default(7),
  /** Glyph pool the reel spins through. */
  charset: z.string().default('0123456789'),
  /** Text color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Pixels. Wins over `size` if both are passed. */
  fontSize: z.number().default(140),
  /** Semantic typography role — canvas-aware pixels. */
  size: sizeRoleSchema.optional(),
  /** Monospace stack keeps reels column-aligned. */
  fontFamily: z.string().default('"Space Grotesk", ui-monospace, monospace'),
  /** Font weight. */
  fontWeight: z.number().default(600),
  /** CSS letter-spacing. */
  letterSpacing: z.string().default('0.02em'),
  /** Text alignment. */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link SlotMachineRoll}. */
export type SlotMachineRollProps = z.infer<typeof slotMachineRollSchema>;
