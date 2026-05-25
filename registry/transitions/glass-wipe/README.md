# glassWipe

The incoming scene wipes in from a direction behind a frosted-glass edge that sharpens as it settles, while the outgoing scene frosts over beneath it. Reads like a sheet of glass sliding across — calmer than a hard wipe, more textured than a cross-fade.

Onda-original. Use inside Remotion's `<TransitionSeries>`.

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | Where the incoming scene wipes in from. |
| `frost` | `number` | `16` | Peak edge blur (px); clears as it settles. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { glassWipe } from './components/onda/transitions/glass-wipe/glassWipe';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={glassWipe({ direction: 'left' })}
    timing={linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```
