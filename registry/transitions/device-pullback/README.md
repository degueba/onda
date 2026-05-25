# devicePullback

The outgoing scene starts as full-bleed UI content scaled up, then pulls back to 1x while a minimal device bezel — laptop or phone, built from plain divs and token borders — draws in around it. The cut lands on the content framed inside a clean device mockup. A "pull back to reveal the product" beat, common in launch and feature reels.

Onda-original. Use inside Remotion's `<TransitionSeries>`.

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `device` | `'laptop' \| 'phone'` | `'laptop'` | Which bezel draws in around the content. |
| `frameColor` | `string` | `'#1C1C22'` | Bezel / frame color (Onda border tone). |
| `startScale` | `number` | `2` | How far content is scaled up before pulling back to 1x. |
| `background` | `string` | `'#08080A'` | Fill behind the device once framed. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { devicePullback } from './components/onda/transitions/device-pullback/devicePullback';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}><AppScreen /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={devicePullback({ device: 'laptop' })}
    timing={linearTiming({ durationInFrames: 24, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><NextScene /></TransitionSeries.Sequence>
</TransitionSeries>
```
