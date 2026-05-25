# SplitScreen

A two-pane split layout. Pass `left` and `right` content (any JSX); they sit side-by-side (or stacked when `orientation="vertical"`), divided by a thin token line. Like `browser-frame` and `device-frame`, it's a **container** — the documented exception to the component contract's "self-contained" rule, since wrapping arbitrary content is its entire purpose. When `animate`, the two panes slide in from their outer edges on the house spring (a 16px settle), each from the opposite side. Use `ratio` to make one pane larger than the other.

Because the panes are `React.ReactNode`, they live on the component's TS props rather than in the Zod schema (`splitScreenSchema` covers only the serializable layout props) — the same approach `browser-frame` / `device-frame` take for `children`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `left` | `ReactNode?` | — | Left (or top) pane content. |
| `right` | `ReactNode?` | — | Right (or bottom) pane content. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Pane axis — side-by-side or stacked. |
| `ratio` | `number` | `0.5` | Fraction (0..1) of the main axis given to the `left`/top pane. |
| `gap` | `number` | `0` | Gap between panes in px. |
| `divider` | `boolean` | `true` | Thin token line between panes. |
| `animate` | `boolean` | `true` | Slide the panes in from their outer edges. |
| `delay` | `number` | `0` | Frames before the entrance. |
| `width` | `number` | `1280` | Overall width in px. |
| `height` | `number` | `720` | Overall height in px. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { SplitScreen } from './components/onda/split-screen/SplitScreen';

export const CompareScene = () => (
  <SplitScreen
    placement="center"
    ratio={0.5}
    left={
      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#8E8E98', fontFamily: '"Clash Display", sans-serif', fontSize: 64 }}>
        Before
      </div>
    }
    right={
      <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#F2F2F4', fontFamily: '"Clash Display", sans-serif', fontSize: 64 }}>
        After
      </div>
    }
  />
);
```
