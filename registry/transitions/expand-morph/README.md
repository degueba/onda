# expandMorph

A rounded "card" starts at a small origin rect — a region of the outgoing scene — and smoothly expands (top/left/width/height and corner radius all interpolated together) to fill the screen, revealing the incoming scene as it grows. The outgoing scene fades out over the first third; the incoming scene fades and settles in over the final third. Onda's calm take on a morphing modal / image-expand-to-fullscreen reveal — one eased timeline, no overshoot.

Onda-original. Use inside Remotion's `<TransitionSeries>`.

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `fromX` | `number` | `0.375` | Origin rect left edge, as a 0..1 fraction of canvas width. |
| `fromY` | `number` | `0.375` | Origin rect top edge, as a 0..1 fraction of canvas height. |
| `fromWidth` | `number` | `0.25` | Origin rect width, as a 0..1 fraction of canvas width. |
| `fromHeight` | `number` | `0.25` | Origin rect height, as a 0..1 fraction of canvas height. |
| `borderRadiusFrom` | `number` | `20` | Card corner radius (px) at its small origin size. |
| `borderRadiusTo` | `number` | `0` | Card corner radius (px) once it fills the screen. |
| `background` | `string` | `'#08080A'` | Fill behind the morphing card while it expands. |

The defaults describe a centered quarter-size rect that grows to fullscreen with rounded corners squaring off as it lands.

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { expandMorph } from './components/onda/transitions/expand-morph/expandMorph';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={expandMorph({ fromX: 0.4, fromY: 0.4, fromWidth: 0.2, fromHeight: 0.2 })}
    timing={linearTiming({ durationInFrames: 24, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```
