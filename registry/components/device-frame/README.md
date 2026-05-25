# DeviceFrame

A phone or laptop bezel that wraps arbitrary content. Pass `children` (JSX), an image `src`, or neither. Like `browser-frame`, it's a **container** — the documented exception to the "self-contained" rule — and it scales-and-fades in on the house spring. Height is derived from the device aspect, so you only set `width`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `device` | `'phone' \| 'laptop'` | `'phone'` | Which bezel to draw. |
| `src` | `string?` | — | Image shown when no children. |
| `children` | `ReactNode?` | — | Content to wrap (JSX only). |
| `delay` | `number` | `0` | Frames before entrance. |
| `animate` | `boolean` | `true` | Scale-and-fade in. |
| `width` | `number` | `420` | Device width (height derived). |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { DeviceFrame } from './components/onda/device-frame/DeviceFrame';

export const ProductScene = () => (
  <DeviceFrame device="phone" src="/app-screenshot.png" placement="center" />
);
```
