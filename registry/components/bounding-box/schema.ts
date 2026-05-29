import { z } from 'zod';
import { DURATION } from '../../../lib/motion';

/** Zod schema for {@link BoundingBox} props. */
export const boundingBoxSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('bounding-box').default('bounding-box'),
  /** Box left edge as a `0..1` fraction of the canvas width. */
  x: z.number().min(0).max(1).default(0.3),
  /** Box top edge as a `0..1` fraction of the canvas height. */
  y: z.number().min(0).max(1).default(0.3),
  /** Box width as a `0..1` fraction of the canvas width. */
  width: z.number().min(0).max(1).default(0.4),
  /** Box height as a `0..1` fraction of the canvas height. */
  height: z.number().min(0).max(1).default(0.4),
  /** Optional label tag pinned to the box's top-left corner. Empty string hides it. */
  label: z.string().default(''),
  /** Outline / tick / tag color. Defaults to the Onda accent (`--onda-accent`, `#D96B82`) — the highlight is earned here. */
  color: z.string().default('var(--onda-accent, #D96B82)'),
  /** Frames before the outline starts drawing. */
  delay: z.number().int().min(0).default(0),
  /** Frames to draw the full rectangle outline. */
  drawDuration: z.number().int().min(1).default(DURATION.slow),
  /** Outline stroke width in px. */
  strokeWidth: z.number().min(0).default(3),
  /** Draw small L-shaped tick marks at each corner after the outline lands. */
  corners: z.boolean().default(true),
  /** Label text color. Defaults to `--onda-bg` (`#08080A`) for contrast on the accent tag. */
  labelColor: z.string().default('var(--onda-bg, #08080A)'),
  /** Label font size in px. */
  fontSize: z.number().default(16),
  /** Onda display font. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
});

/** Inferred props for {@link BoundingBox}. */
export type BoundingBoxProps = z.infer<typeof boundingBoxSchema>;
