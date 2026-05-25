# flip

A 3D card-flip between two scenes. The outgoing scene rotates away; the incoming scene rotates into view from the opposite side.

The most dramatic of the wrapped Remotion transitions — use when a beat genuinely warrants a "now we're looking at something new" punch.

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | Rotation axis. `'left'` flips around a vertical axis, revealing the new face from the right edge. |
| `perspective` | `number > 0` | `1000` | Distance of the implicit "camera" from the flipping plane (px). Lower = more dramatic 3D depth; higher = subtler. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { flip } from './components/onda/transitions/flip/flip';

<TransitionSeries.Transition
  presentation={flip({ direction: 'left' })}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **Use sparingly.** A flip is loud — if every cut uses it, the composition reads as a slideshow. Reserve for genuine "card turn" moments.
- **`perspective` tuning.** The default `1000` is balanced. Drop to `600` for a more dramatic camera-close-to-the-scene look; raise to `2000` for an almost-flat rotation.
- **Pair with the house timing** — `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })`. The cubic-bezier easing softens the flip's midpoint so it doesn't feel mechanical.
