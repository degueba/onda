# BentoGrid

A data-driven bento layout: a CSS grid of glass `Surface` cards with varying column/row spans, driven entirely by an `items` array. Each cell rises and fades in on the house spring, staggered left-to-right (4-frame default), so the grid assembles as one calm cascade rather than popping all at once. Cells carry an optional large `value`, a `title`, and a `caption`; the single `accent` cell earns the rose. Renders a complete, premium bento with zero props.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `BentoItem[]` | sample 4-card set | Each: `title`, optional `value` / `caption`, `colSpan` (1), `rowSpan` (1), `accent` (false). |
| `columns` | `number` | `3` | Grid column count. |
| `gap` | `number` | `20` | Gap between cells in px. |
| `width` | `number` | `960` | Overall grid width in px. |
| `padding` | `number` | `28` | Inner padding of each cell. |
| `delay` | `number` | `0` | Frames before the first cell enters. |
| `stagger` | `number` | `4` | Frames between successive cells. |
| `fontSize` | `number` | `30` | Base title size; wins over `size`. |
| `size` | size role | — | Semantic role (`hero`…`caption`); resolves to canvas-aware px. |
| `color` | `string` | `#F2F2F4` | Title color. |
| `captionColor` | `string` | `#8E8E98` | Caption color. |
| `accentColor` | `string` | `#D96B82` | Earned-accent cell color. |
| `fontFamily` | `string` | Clash Display | Title / value font. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { Composition } from 'remotion';
import { BentoGrid } from './components/onda/bento-grid/BentoGrid';

const FeatureBento = () => (
  <BentoGrid
    placement="center"
    columns={3}
    items={[
      { title: 'Motion identity', caption: 'One consistent feel.', colSpan: 2 },
      { title: 'Render', value: '4K', accent: true },
      { title: 'Components', value: '40+' },
      { title: 'Spring physics', caption: 'No overshoot.', colSpan: 2 },
    ]}
  />
);

export const BentoComposition = () => (
  <Composition
    id="FeatureBento"
    component={FeatureBento}
    durationInFrames={120}
    fps={30}
    width={1920}
    height={1080}
  />
);
```
