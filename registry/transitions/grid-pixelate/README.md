# gridPixelate

The scene breaks into a grid of cells that flip in a seeded scatter — the outgoing scene pixelates away to the canvas color while the incoming assembles from it. The cell reveal order comes from a seeded PRNG, so the scatter is deterministic and identical every render. A retro, high-energy cut.

Onda-original. Use inside Remotion's `<TransitionSeries>`.

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `cols` | `number` | `24` | Cell columns. |
| `rows` | `number` | `14` | Cell rows. |
| `seed` | `number` | `7` | Deterministic reveal-order seed. |
| `color` | `string` | `#08080A` | Cell fill while covering — match your canvas. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { gridPixelate } from './components/onda/transitions/grid-pixelate/gridPixelate';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={gridPixelate()}
    timing={linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```
