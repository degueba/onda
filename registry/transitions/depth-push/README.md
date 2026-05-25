# depthPush

Push with parallax depth — outgoing scene scales down slightly as it pushes off, incoming scales from slightly larger. Reads as a camera dolly between scenes.

The catalog's signature multi-scene move.

## When to use

| If you want… | Use |
| --- | --- |
| Plain camera pan (no depth) | `push` |
| Camera dolly (pan + depth) | **`depthPush`** |
| Just the new scene slides in | `slide` |

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | Direction the camera move travels. |
| `scaleAmount` | `number 0..0.3` | `0.05` | Parallax depth amount. Outgoing recedes by this factor; incoming approaches from this factor larger. Default `0.05` is the Onda-recommended subtlety. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { depthPush } from './components/onda/transitions/depth-push/depthPush';

<TransitionSeries.Transition
  presentation={depthPush({ direction: 'left' })}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **Default scale is intentionally small.** `0.05` ≈ 5% — enough for the eye to read depth without it announcing itself as a 3D effect. Push past `0.15` and it starts to feel like a movie trailer "zoom-and-push." Stay under for the Onda restraint.
- **Combines two motions cleanly.** Translation gives the pan; scale gives the depth. The cubic-bezier easing keeps both feeling like one unified motion rather than two effects stacked.
- **Pair with the house timing.** The same 18-frame cadence used by `crossFade`, `morph`, etc. keeps cuts in rhythm with the scenes.
