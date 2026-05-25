# zoom

Scale-driven punch transition. The catalog's lone "accent" register — use sparingly so it stays a punctuation moment.

When every other cut in the composition uses calm transitions (`crossFade`, `morph`), a single `zoom` reads as deliberate emphasis by contrast.

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `'in' \| 'out'` | `'in'` | `'in'` = incoming scene approaches the viewer (outgoing scales up out of frame; incoming arrives from slightly larger). `'out'` = incoming pulls back (outgoing shrinks inward; incoming arrives from slightly smaller). |
| `scaleAmount` | `number 0.05..0.5` | `0.2` | Maximum scale delta. Smaller values read closer to `morph`; larger values lean into "punch." Default `0.2` is the recommended punch — visible without being loud. |

## Usage

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { zoom } from './components/onda/transitions/zoom/zoom';

<TransitionSeries.Transition
  presentation={zoom({ direction: 'in' })}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **Use sparingly.** If every cut uses `zoom`, none of them are accents. Reserve for the one moment in a composition where the cut itself is meant to read as a beat.
- **`'in'` is the default.** Reads as "camera moves toward the new scene" — the more energetic, forward-leaning choice. `'out'` is for "stepping back" moments (revealing context, ending a thought).
- **`scaleAmount` calibration.** `0.2` is the catalog's calibrated default. Drop to `0.1` for something between `morph` and `zoom`; push to `0.4+` only if the scene genuinely earns the drama.
- **Pair with the house timing** — even on a punchy transition, the cubic-bezier easing keeps the scale from feeling mechanical.
