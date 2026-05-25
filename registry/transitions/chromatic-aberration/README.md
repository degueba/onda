# chromaticAberration

The cut tears into red/cyan channels and snaps back. The outgoing scene splits wider as it fades; the incoming scene converges from a split as it fades in. Built with layered `drop-shadow` channel ghosts — the catalog's most aggressive transition, meant as a punctuation move, not a default cut.

Onda-original. Use inside Remotion's `<TransitionSeries>`.

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `intensity` | `number` | `24` | Peak channel split (px) at the cut. |
| `redColor` | `string` | `rgba(255,77,109,0.6)` | Red ghost color. |
| `cyanColor` | `string` | `rgba(77,226,255,0.6)` | Cyan ghost color. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { chromaticAberration } from './components/onda/transitions/chromatic-aberration/chromaticAberration';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={chromaticAberration()}
    timing={linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```
