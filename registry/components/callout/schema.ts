import { z } from 'zod';
import { DURATION } from '../../../lib/motion';

/** Zod schema for {@link Callout} props. */
export const calloutSchema = z.object({
  /** Bubble label. */
  label: z.string().default('Look here'),
  /** Anchor point X as a `0..1` fraction of the canvas width. */
  x: z.number().min(0).max(1).default(0.5),
  /** Anchor point Y as a `0..1` fraction of the canvas height. */
  y: z.number().min(0).max(1).default(0.5),
  /** Which quadrant the bubble sits in relative to the anchor. */
  position: z
    .enum(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
    .default('top-right'),
  /** Pixel distance from anchor to bubble center. */
  offset: z.number().int().min(0).default(160),
  /** Frames before the bubble starts revealing. */
  delay: z.number().int().min(0).default(0),
  /** Bubble reveal duration in frames. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Frames to wait after the bubble lands before the arrow starts. */
  lineDelay: z.number().int().min(0).default(6),
  /** Arrow draw-on duration in frames. */
  lineDuration: z.number().int().min(1).default(DURATION.base),
  /** Label color. Defaults to `--onda-text` (`#F2F2F4`). */
  color: z.string().default('#F2F2F4'),
  /** Bubble background. Defaults to `--onda-surface` (`#0E0E12`). */
  bgColor: z.string().default('#0E0E12'),
  /** Bubble border. Defaults to `--onda-border-lit` (`#26262E`). */
  borderColor: z.string().default('#26262E'),
  /** Arrow stroke color. */
  arrowColor: z.string().default('#F2F2F4'),
  /** Arrow stroke width in px. */
  arrowWidth: z.number().default(2),
  /** Label font size in px. */
  fontSize: z.number().default(20),
  /** Onda display font. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
});

/** Inferred props for {@link Callout}. */
export type CalloutProps = z.infer<typeof calloutSchema>;
