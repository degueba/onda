# Button

A CTA pill button. `variant="primary"` fills with the earned accent; `variant="ghost"` is transparent with an accent border. It fades and rises in on the house entrance, then plays an optional click-dip at `pressFrame` — a quick scale down to `0.94` and back that reads as a press. Fully deterministic: the dip is a pure function of the frame's distance from `pressFrame`, no timers or state.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `"Get started"` | Button text. |
| `variant` | `'primary' \| 'ghost'` | `'primary'` | Accent fill vs. bordered outline. |
| `accent` | `string` | `#D96B82` | Drives the fill, glow, and ghost border/text. |
| `press` | `boolean` | `true` | Play the click-dip. |
| `pressFrame` | `number` | `30` | Frame the dip lands on (local timeline). |
| `delay` | `number` | `0` | Frames before the entrance. |
| `width` | `number` | — | Fixed width in px; omit for auto width. |
| `fontSize` | `number` | `24` | Label size; wins over `size`. |
| `size` | size role | — | Canvas-aware label size; `fontSize` wins when both passed. |
| `fontFamily` | `string` | Clash Display | Label font. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { Button } from './components/onda/button/Button';

export const CtaScene = () => (
  <Button label="Get started" variant="primary" pressFrame={30} placement="lower-third" />
);
```
