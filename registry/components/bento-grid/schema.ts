import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** A single bento cell. Spans default to 1×1; `accent` earns the rose tint. */
export const bentoItemSchema = z.object({
  /** Cell title (display font). */
  title: z.string(),
  /** Optional headline figure shown large above the title (e.g. `'98%'`). Empty hides it. */
  value: z.string().optional(),
  /** Optional caption beneath the title. Empty hides it. */
  caption: z.string().optional(),
  /** Columns this cell spans. Clamped to the grid's `columns`. */
  colSpan: z.number().int().min(1).default(1),
  /** Rows this cell spans. */
  rowSpan: z.number().int().min(1).default(1),
  /** Marks the one earned-accent cell — rose value + accent border. Use sparingly. */
  accent: z.boolean().default(false),
});

/** Inferred type for a single {@link BentoGrid} cell. */
export type BentoItem = z.infer<typeof bentoItemSchema>;

/** Zod schema for {@link BentoGrid} props. */
export const bentoGridSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('bento-grid').default('bento-grid'),
  /** The cells, laid out left-to-right, top-to-bottom. Spans drive the bento rhythm. */
  items: z
    .array(bentoItemSchema)
    .default([
      { title: 'Motion identity', caption: 'One consistent feel across every component.', colSpan: 2, rowSpan: 1, accent: false },
      { title: 'Render', value: '4K', caption: 'Deterministic, frame-perfect.', colSpan: 1, rowSpan: 1, accent: true },
      { title: 'Components', value: '40+', caption: 'Copied into your project.', colSpan: 1, rowSpan: 1, accent: false },
      { title: 'Spring physics', caption: 'No overshoot. Calm by default.', colSpan: 2, rowSpan: 1, accent: false },
    ]),
  /** Number of grid columns. */
  columns: z.number().int().min(1).default(3),
  /** Gap between cells in px. */
  gap: z.number().default(20),
  /** Overall grid width in px. */
  width: z.number().default(960),
  /** Inner padding of each cell in px. */
  padding: z.number().default(28),
  /** Frames before the first cell enters. */
  delay: z.number().int().min(0).default(0),
  /** Frames between successive cells rising in. House stagger is 4. */
  stagger: z.number().int().min(0).default(4),
  /** Base title font size in px. Wins over `size` if both are passed. */
  fontSize: z.number().default(30),
  /** Semantic typography role for the title — resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Title color. Defaults to `--onda-text`. */
  color: z.string().default('#F2F2F4'),
  /** Caption color. Defaults to `--onda-dim`. */
  captionColor: z.string().default('#8E8E98'),
  /** Accent color for the earned `accent` cell. Defaults to `--onda-accent`. */
  accentColor: z.string().default('#D96B82'),
  /** Onda display font for titles and values. */
  fontFamily: z.string().default('"Clash Display", sans-serif'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link BentoGrid}. */
export type BentoGridProps = z.infer<typeof bentoGridSchema>;
