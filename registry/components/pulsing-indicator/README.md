# PulsingIndicator

A live status dot with a calm expanding-ring pulse and an optional label. The pulse is keyed off `frame % period`, so it loops seamlessly and renders deterministically — no timers, one steady ring rather than a strobe. The dot carries the earned accent by default.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `color` | `string` | `#D96B82` | Dot + ring color. |
| `size` | `number` | `20` | Dot diameter in px. |
| `label` | `string` | `"LIVE"` | Text to the right; empty hides it. |
| `labelColor` | `string` | `#8E8E98` | Label color. |
| `fontFamily` / `fontSize` | — | UI defaults | Label type. |
| `period` | `number` | `45` | Frames per pulse cycle. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { PulsingIndicator } from './components/onda/pulsing-indicator/PulsingIndicator';

export const StatusScene = () => (
  <PulsingIndicator label="LIVE" placement="upper-right" />
);
```
