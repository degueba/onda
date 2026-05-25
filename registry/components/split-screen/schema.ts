import { z } from 'zod';
import { placementSchema } from '../../../lib/canvas-schemas';

/**
 * Zod schema for {@link SplitScreen}'s *serializable* props.
 *
 * The two content panes (`left` / `right`) are `React.ReactNode` and can't be
 * Zod-validated, so — like `browser-frame` / `device-frame` do for `children`
 * — they live only on the component's TS props, not in this schema. This schema
 * covers everything that is plain data (layout, ratio, animation).
 */
export const splitScreenSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted. */
  kind: z.literal('split-screen').default('split-screen'),
  /** Pane axis: `horizontal` = side-by-side, `vertical` = stacked. */
  orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  /** Fraction (0..1) of the main axis given to the `left` (or top) pane. */
  ratio: z.number().min(0).max(1).default(0.5),
  /** Gap between the two panes in px. */
  gap: z.number().min(0).default(0),
  /** Draw a thin token divider in the gap between the panes. */
  divider: z.boolean().default(true),
  /** Slide the two panes in from their outer edges on the house spring. */
  animate: z.boolean().default(true),
  /** Frames before the entrance. */
  delay: z.number().int().min(0).default(0),
  /** Overall width in px. */
  width: z.number().default(1280),
  /** Overall height in px. */
  height: z.number().default(720),
  /** Where on the canvas this sits. */
  placement: placementSchema.optional(),
});

/**
 * Inferred props for {@link SplitScreen}. The `left` / `right` `ReactNode`
 * panes are added on top of this in the component file (see `SplitScreenProps`).
 */
export type SplitScreenSchemaProps = z.infer<typeof splitScreenSchema>;
