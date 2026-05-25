# wipe

A hard-edged wipe between two scenes. The incoming scene reveals from one edge to the opposite as a moving boundary — sharper than `slide` or `crossFade`, useful when the cut needs to read as a deliberate transition.

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | Direction the wipe boundary travels. `'left'` means the boundary moves leftward, revealing the new scene as it goes. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { wipe } from './components/onda/transitions/wipe/wipe';

<TransitionSeries.Transition
  presentation={wipe({ direction: 'left' })}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **Cardinal directions only.** Remotion's `wipe()` supports 8 directions including diagonals (`from-top-left` etc.); Onda caps at 4 because diagonals tend to read as PowerPoint-y rather than deliberate. If a concrete use case for diagonals shows up, the wrapper can be extended.
- **Hard edge by default.** The wipe's boundary is sharp. For a softer edge, use `crossFade` instead.
- **Pair with the house timing** — `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })` keeps the cut in the same rhythm as Onda's scene entrances.
