import { z } from 'zod';
import { DURATION } from '../../../lib/motion';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** Zod schema for {@link IconPop} props. */
export const iconPopSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('icon-pop').default('icon-pop'),
  /** Which icon to render. */
  icon: z.enum(['check', 'cross', 'dot', 'star']).default('check'),
  /** Frames before the animation starts. */
  delay: z.number().int().min(0).default(0),
  /** Frames to settle. */
  duration: z.number().int().min(1).default(DURATION.base),
  /** Icon size in pixels (square). Wins over `size` if both are passed. */
  iconSize: z.number().default(96),
  /** Semantic size role — resolves to canvas-aware pixels via the smaller canvas dimension. Overrides `iconSize`'s default when passed alone; `iconSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Icon color. Defaults to `--onda-accent` (`#D96B82`) — accent earned. */
  color: z.string().default('#D96B82'),
  /** Stroke width for outline icons (check, cross). Ignored by filled icons. */
  strokeWidth: z.number().default(3),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link IconPop}. */
export type IconPopProps = z.infer<typeof iconPopSchema>;
