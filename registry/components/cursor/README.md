# Cursor

An animated pointer that travels from one canvas point to another on the house spring (`useSpringValue`) and emits a single restrained click ripple on arrival. It's a full-canvas layer — you position it with the `from*` / `to*` fractions (0..1 of the canvas), not with `placement`. Pairs with `code-block`, `terminal`, and `browser-frame` to narrate product and dev demos.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `fromX` / `fromY` | `number` | `0.28` / `0.72` | Start point (canvas fractions). |
| `toX` / `toY` | `number` | `0.6` / `0.42` | End point (canvas fractions). |
| `delay` | `number` | `6` | Frames before moving. |
| `travelDuration` | `number` | `24` | Frames to travel. |
| `click` | `boolean` | `true` | Emit a click ripple on arrival. |
| `clickDelay` | `number` | `6` | Frames after arrival before the click. |
| `color` | `string` | `#F2F2F4` | Pointer + ripple color. |
| `size` | `number` | `56` | Pointer height in px. |

## Usage

```tsx
import { AbsoluteFill } from 'remotion';
import { Cursor } from './components/onda/cursor/Cursor';

export const ClickScene = () => (
  <AbsoluteFill>
    {/* ...UI under the cursor... */}
    <Cursor fromX={0.3} fromY={0.7} toX={0.55} toY={0.4} />
  </AbsoluteFill>
);
```
