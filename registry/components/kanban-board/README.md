# KanbanBoard

A data-driven Kanban board — glass `Surface` columns, each with a header, a status dot, a live ticket count, and a stack of small glass ticket cards. Every card rises + fades in on the house spring, staggered across the whole board (left-to-right, top-to-bottom) so it assembles as one calm cascade rather than popping all at once. Pass `columns` to drive the content; give one column an `accent` to earn the rose. The board is static after the entrance — any "flying ticket" between columns is the consumer's job, not this component's. Self-contained except the shared `Surface` primitive and the `useStaggeredEntrance` hook.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `{ title, accent?, cards: string[] }[]` | Todo / In Progress / Done | The columns, laid out left-to-right; each holds its own ticket cards. |
| `width` | `number` | `1040` | Overall board width; split evenly across columns. |
| `gap` | `number` | `20` | Gap between columns (and between cards within a column). |
| `delay` | `number` | `0` | Frames before the first card enters. |
| `stagger` | `number` | `4` | Frames between successive cards rising in. |
| `fontSize` | `number` | `22` | Column-header font size; wins over `size`. |
| `size` | `'hero' \| 'heading' \| 'subheading' \| 'body' \| 'caption'` | — | Semantic header size; resolves to canvas-aware px. `fontSize` wins when both are passed. |
| `fontFamily` | `string` | Clash Display | Display font for headers and ticket labels. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { KanbanBoard } from './components/onda/kanban-board/KanbanBoard';

export const BoardScene = () => (
  <KanbanBoard
    placement="center"
    columns={[
      { title: 'Backlog', cards: ['Research', 'Wireframes'] },
      { title: 'Building', accent: '#D96B82', cards: ['Hero animation'] },
      { title: 'Shipped', cards: ['Landing page', 'Docs'] },
    ]}
  />
);
```
