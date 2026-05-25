# TrackingIn

The text begins spread wide and contracts to its resting tracking on the house spring, fading — and optionally sharpening from a soft blur — as it settles. A confident, cinematic title entrance with no overshoot. Best on short, uppercase display copy.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `"Onda"` | The text to settle in. |
| `delay` | `number` | `0` | Frames before the entrance. |
| `duration` | `number` | `24` | Frames until settled. |
| `color` | `string` | `#F2F2F4` | Text color. |
| `fromTracking` | `number` (em) | `0.5` | Starting letter-spacing. |
| `tracking` | `number` (em) | `-0.02` | Resting letter-spacing. |
| `blur` | `boolean` | `true` | Sharpen from a soft blur. |
| `fontSize` / `size` | `number` / role | `96` | Explicit px or canvas-aware role. |
| `fontFamily`, `fontWeight`, `lineHeight`, `align` | — | display defaults | Typography vocabulary. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { TrackingIn } from './components/onda/tracking-in/TrackingIn';

export const TitleScene = () => (
  <TrackingIn text="ONDA" placement="center" />
);
```
