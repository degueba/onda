import { z } from 'zod';
import { placementSchema, sizeRoleSchema } from '../../../lib/canvas-schemas';

/** A single Kanban column: a header, an optional accent, and its ticket cards. */
export const kanbanColumnSchema = z.object({
  /** Column header (display font), e.g. `'In Progress'`. */
  title: z.string(),
  /** Status-dot + count color for this column. Defaults to a neutral dim token; one column should earn the rose. */
  accent: z.string().optional(),
  /** Ticket labels — one small glass card per entry, top-to-bottom. */
  cards: z.array(z.string()).default([]),
});

/** Inferred type for a single {@link KanbanBoard} column. */
export type KanbanColumn = z.infer<typeof kanbanColumnSchema>;

/** Zod schema for {@link KanbanBoard} props. */
export const kanbanBoardSchema = z.object({
  /** Discriminator literal — matches this entry's registry slug. Auto-populated when omitted (`schema.parse({})` works as before). Lets consumers build `z.discriminatedUnion('kind', [...])` directly over onda schemas. */
  kind: z.literal('kanban-board').default('kanban-board'),
  /** The columns, laid out left-to-right. Each holds its own ticket cards. */
  columns: z
    .array(kanbanColumnSchema)
    .default([
      {
        title: 'Todo',
        cards: ['Storyboard the intro', 'Source b-roll', 'Write VO script'],
      },
      {
        title: 'In Progress',
        accent: 'var(--onda-accent, #D96B82)',
        cards: ['Animate the title card', 'Color-grade scene 2'],
      },
      {
        title: 'Done',
        cards: ['Lock the edit', 'Render preview', 'Sound pass', 'Export master'],
      },
    ]),
  /** Overall board width in px. Split evenly across the columns. */
  width: z.number().default(1040),
  /** Gap between columns (and between cards within a column) in px. */
  gap: z.number().default(20),
  /** Frames before the first card enters. */
  delay: z.number().int().min(0).default(0),
  /** Frames between successive cards rising in. House stagger is 4. */
  stagger: z.number().int().min(0).default(4),
  /** Base column-header font size in px. Wins over `size` if both are passed. */
  fontSize: z.number().default(22),
  /** Semantic typography role for the column header — resolves to canvas-aware pixels via the smaller canvas dimension. `fontSize` wins when both are passed. */
  size: sizeRoleSchema.optional(),
  /** Onda display font for headers and ticket labels. */
  fontFamily: z.string().default('var(--onda-font-display, "Clash Display", sans-serif)'),
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});

/** Inferred props for {@link KanbanBoard}. */
export type KanbanBoardProps = z.infer<typeof kanbanBoardSchema>;
