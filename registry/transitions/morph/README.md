# morph

Cross-fade plus a subtle synchronized scale — outgoing 1 → 1.04, incoming 0.96 → 1. The scale is small enough to register as polish, not effect.

Reads as cinematic where `crossFade` reads as flat. The defining "premium feel" transition in the catalog.

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `scaleAmount` | `number 0..0.2` | `0.04` | Max scale delta around 1.0. `0.04` (default) is the Onda-recommended subtlety. Push higher only if the scene genuinely warrants drama; over `0.1` it starts to read as "zoom transition" rather than "morph." |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { morph } from './components/onda/transitions/morph/morph';

<TransitionSeries.Transition
  presentation={morph()}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **The default scale is intentionally small.** `0.04` ≈ 4% — visible enough to give the cut depth, small enough that viewers don't perceive it as an effect. Bumping past `0.10` shifts the read from "morph" to "zoom" — use `zoom` directly if that's the intent.
- **Centered around 1.0.** The midpoint of the transition has BOTH scenes scaled slightly off — outgoing at ~1.02, incoming at ~0.98 — and the eye reads this as the cut having "depth."
- **Pair with the house timing.** The cubic-bezier easing is what makes the scale read as breath, not as motion.
