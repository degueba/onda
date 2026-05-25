import { z } from 'zod';

/** Zod schema for {@link Confetti} props. */
export const confettiSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('confetti').default('confetti'),
  /** Seed for every per-piece random (angle, velocity, spin, color, size) — same seed always produces the same burst (§1). */
  seed: z.number().int().default(7),
  /** Number of confetti pieces. ~80 reads full without thrashing the render. */
  count: z.number().int().min(1).default(80),
  /** Palette pieces are picked from. Defaults to the Onda accent plus tasteful neutrals. */
  colors: z.array(z.string()).default(['#D96B82', '#E89AAB', '#F2F2F4', '#8E8E98', '#26262E']),
  /** Burst origin X, as a fraction of canvas width (0 = left, 1 = right). */
  originX: z.number().min(0).max(1).default(0.5),
  /** Burst origin Y, as a fraction of canvas height (0 = top, 1 = bottom). */
  originY: z.number().min(0).max(1).default(0.35),
  /** Frames before the burst launches. */
  delay: z.number().int().min(0).default(0),
  /** Frames over which a piece travels, tumbles and fades out. */
  duration: z.number().int().min(1).default(70),
  /** Launch spread, in degrees, around straight up. Wider = more fan-out. */
  spread: z.number().min(0).max(360).default(120),
  /** Downward acceleration. Higher = pieces fall back faster. */
  gravity: z.number().min(0).default(1),
  /** Base piece size in pixels — each piece varies around this. */
  pieceSize: z.number().min(1).default(12),
});

/** Inferred props for {@link Confetti}. */
export type ConfettiProps = z.infer<typeof confettiSchema>;
