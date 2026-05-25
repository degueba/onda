# blur

Outgoing scene blurs out as it fades; incoming scene blurs in as it fades up. Extends the `BlurReveal` entrance fingerprint across a cut — the missing transition-side of the catalog's most-used reveal.

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `blurAmount` | `number 0..40` | `10` | Max blur radius in px. `10` matches the `BlurReveal` component's default and keeps the fingerprint consistent across the catalog. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { blur } from './components/onda/transitions/blur/blur';

<TransitionSeries.Transition
  presentation={blur()}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **Default `blurAmount: 10` matches `BlurReveal`.** Same maximum blur radius the catalog's reference text-entrance uses. A scene that opens with a `BlurReveal` text and is preceded by a `blur` transition feels seamless because both motions use the same defocus value.
- **Combines blur and opacity.** The eye reads the cut as "scene defocusing and disappearing" rather than as two separate effects.
- **Pair with the house timing** for the standard rhythm.
