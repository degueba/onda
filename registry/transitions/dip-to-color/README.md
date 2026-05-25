# dipToColor

The editing-room classic: outgoing scene fades to a solid color, incoming fades up from it. Reads as "time passes" or "scene break."

Default color is `--onda-bg` (`#08080A`) for brand consistency. Pass `'#000'` for traditional dip-to-black, `'#fff'` for dip-to-white.

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `color` | `string` | `"#08080A"` | The solid color to dip through. Defaults to `--onda-bg` so the cut stays on-brand. Override with `'#000'`, `'#fff'`, or any hex / CSS color string. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { dipToColor } from './components/onda/transitions/dip-to-color/dipToColor';

<TransitionSeries.Transition
  presentation={dipToColor()}  // dips through --onda-bg
  timing={linearTiming({
    durationInFrames: 30,        // longer than 18 reads more like a scene break
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

Editorial dip-to-black:

```tsx
<TransitionSeries.Transition
  presentation={dipToColor({ color: '#000' })}
  timing={linearTiming({ durationInFrames: 30, easing: Easing.bezier(0.16, 1, 0.3, 1) })}
/>
```

## Composition notes

- **Two-stage timing.** First half: outgoing fades to color. Second half: color fades to incoming. The color is most visible at the exact midpoint of the transition.
- **Default color is `--onda-bg`, not pure black.** Per [017 Q1](../../../docs/techspecs/017-transitions/design.md), every other Onda default uses tokens; the cut should follow suit. Pass `'#000'` if you specifically want the editing convention.
- **Longer duration reads better.** The default 18-frame Onda cadence is too short for a dipToColor — it feels rushed. Use `30-45 frames` for a beat-break feel, longer for a deliberate "act break."
