# typeMask

A giant word holds briefly, then scales up exponentially until the negative space inside its letters blows past the screen edges — and the incoming scene is revealed through the type. The masking word starts solid over the outgoing scene, then dissolves into a window onto the next scene. A kinetic, typographic cut that reaches for punch over calm.

Onda-original. Use inside Remotion's `<TransitionSeries>`.

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string` | `'NEXT'` | The word held then blown up to mask the cut. Short, bold words read best. |
| `holdFrames` | `number` | `0.35` | Portion of the transition (0–1) the type holds at rest before it scales. |
| `maxScale` | `number` | `22` | How large the type scales by the end — large enough to push every letterform past the edges. |
| `color` | `string` | `#F2F2F4` | Fill of the held masking type. |
| `fontFamily` | `string` | `"Clash Display", sans-serif` | Type family for the mask word. Default Clash Display — boldest weight for the widest interior space. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { typeMask } from './components/onda/transitions/type-mask/typeMask';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={typeMask({ text: 'NEXT' })}
    timing={linearTiming({ durationInFrames: 24, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```
