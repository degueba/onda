# push

A directional push between two scenes. Both scenes translate together in the same direction — reads as a camera pan between them.

Different from `slide` (only incoming moves) and `depthPush` (adds parallax scale).

## When to use

| If you want… | Use |
| --- | --- |
| Both scenes move together (camera pan feel) | **`push`** |
| Only the new scene slides in | `slide` |
| Camera pan WITH depth (parallax scale) | `depthPush` |

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | Direction the entire frame pans. `'left'` = both scenes move leftward together. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { push } from './components/onda/transitions/push/push';

<TransitionSeries.Transition
  presentation={push({ direction: 'left' })}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **Both scenes share the same translation vector.** At progress 0.5 the outgoing scene is half-off-screen in the pan direction; the incoming scene is half-on-screen from the opposite edge. They appear as one continuous panning frame.
- **Onda-original.** Remotion's `slide()` only translates the incoming scene; `push` adds the outgoing translation that makes the motion read as a single camera move.
- **Pair with the house timing** for the standard rhythm.
