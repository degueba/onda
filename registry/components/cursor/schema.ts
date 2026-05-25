import { z } from 'zod';
import { DURATION } from '../../../lib/motion';

/** Zod schema for {@link Cursor} props. Positions are 0..1 canvas fractions. */
export const cursorSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('cursor').default('cursor'),
  /** Start X as a 0..1 fraction of canvas width. */
  fromX: z.number().default(0.28),
  /** Start Y as a 0..1 fraction of canvas height. */
  fromY: z.number().default(0.72),
  /** End X as a 0..1 fraction of canvas width. */
  toX: z.number().default(0.6),
  /** End Y as a 0..1 fraction of canvas height. */
  toY: z.number().default(0.42),
  /** Frames before the cursor starts moving. */
  delay: z.number().int().min(0).default(6),
  /** Frames to travel from start to end on the house spring. */
  travelDuration: z.number().int().min(1).default(DURATION.slow),
  /** Emit a click ripple on arrival. */
  click: z.boolean().default(true),
  /** Frames after arrival before the click fires. */
  clickDelay: z.number().int().min(0).default(6),
  /** Pointer + ripple color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Pointer height in px. */
  size: z.number().default(56),
});

/** Inferred props for {@link Cursor}. */
export type CursorProps = z.infer<typeof cursorSchema>;
