import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** One orbiting satellite node in the constellation. */
export const satelliteSchema = z.object({
  /** Short label inside the node — a word or single character reads best. */
  label: z.string(),
  /** Orbit radius in px (distance from the hub). Satellites at varying radii read as depth. */
  radius: z.number().positive(),
  /** Angular speed in radians per frame. Small values keep the drift calm; signed for either direction. */
  speed: z.number(),
  /** Starting angle in radians — where the satellite sits in its orbit at frame 0. */
  startAngle: z.number(),
});

/** Inferred shape for a single {@link NodeGraph} satellite. */
export type Satellite = z.infer<typeof satelliteSchema>;

/** Zod schema for {@link NodeGraph} props. */
export const nodeGraphSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('node-graph').default('node-graph'),
  /** Label inside the central hub node — a single character or short word. */
  hubLabel: z.string().default('AI'),
  /** The orbiting satellites. Each flies in from off-frame, then settles into its elliptical orbit. ~5 reads as a believable constellation. */
  satellites: z.array(satelliteSchema).default([
    { label: 'data',   radius: 260, speed:  0.010, startAngle: 0.4 },
    { label: 'model',  radius: 340, speed: -0.007, startAngle: 1.7 },
    { label: 'render', radius: 210, speed:  0.013, startAngle: 2.9 },
    { label: 'audio',  radius: 380, speed: -0.006, startAngle: 4.1 },
    { label: 'scene',  radius: 300, speed:  0.009, startAngle: 5.3 },
  ]),
  /** The earned accent — hub fill tint, satellite ring, and the lighting-up connection lines. */
  accent: z.string().default('#D96B82'),
  /** Vertical squash of every orbit (1 = circular, <1 = elliptical) — a slight ellipse reads as perspective. */
  ellipse: z.number().min(0.2).max(1).default(0.62),
  /** Seed for the deterministic fly-in directions and the connection-pulse phases. */
  seed: z.number().int().default(7),
  /** Frames before the constellation begins assembling. */
  delay: z.number().int().min(0).default(0),
  /** Show the soft accent glow behind the hub. */
  glow: z.boolean().default(true),
  /** Hub node diameter in px. Wins over `hubSize` if both are passed. */
  hubDiameter: z.number().positive().default(120),
  /** Semantic role for the hub label — resolves to canvas-aware pixels. `hubFontSize` wins when both are passed. */
  hubSize: sizeRoleSchema.optional(),
  /** Hub label size in px. Wins over `hubSize` if both are passed. */
  hubFontSize: z.number().positive().default(34),
  /** Background canvas color behind the constellation. */
  background: z.string().default('#08080A'),
  /** Onda display font for every label. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas the hub (and its orbits) is centered. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Defaults to centered. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link NodeGraph}. */
export type NodeGraphProps = z.infer<typeof nodeGraphSchema>;
