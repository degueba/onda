# slide

A directional slide between two scenes. Only the incoming scene translates; the outgoing scene stays in place. Wraps Remotion's `slide()` with Onda's `left` / `right` / `up` / `down` vocabulary.

For both-scenes-move-together (camera-pan feel), use `push` instead.

## When to use

| If you want… | Use |
| --- | --- |
| New scene slides in, old scene stays | **`slide`** |
| Both scenes move together (camera pan) | `push` |
| Both move with depth (scene 1 recedes, scene 2 approaches) | `depthPush` |
| Plain cross-fade | `crossFade` |

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | The direction the motion appears to travel. `'left'` means both scenes appear to move leftward (new scene enters from the right). |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from './components/onda/transitions/slide/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={slide({ direction: 'left' })}
    timing={linearTiming({
      durationInFrames: 18,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    })}
  />
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Composition notes

- **Direction maps to motion, not entry side.** `'left'` = scenes appear to move leftward = the new scene enters from the right. This matches how most motion-design tools name it; the spec rationale is in [techspec 017](../../../docs/techspecs/017-transitions/design.md).
- **Outgoing scene stays put.** The illusion of a slide comes entirely from the incoming scene's movement. If you want the outgoing scene to translate out with the incoming sliding in, use `push`.
- **House timing is the path of least resistance.** Pair with `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })` — same easing every other Onda primitive uses for opacity / color.
