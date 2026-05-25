# clockWipe

A clock-hand wipe — the boundary between scenes rotates around the canvas center like a sweeping clock hand. Distinctive; use sparingly so it stays "deliberate" rather than gimmicky.

## Options

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `width` | `integer > 0` | ✓ | Canvas width in px. Typically `useVideoConfig().width`. |
| `height` | `integer > 0` | ✓ | Canvas height in px. Typically `useVideoConfig().height`. |

## Usage

```tsx
import { Easing, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { clockWipe } from './components/onda/transitions/clock-wipe/clockWipe';

const MyScene = () => {
  const { width, height } = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={150}>
        <Scene1 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={clockWipe({ width, height })}
        timing={linearTiming({
          durationInFrames: 18,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}
      />
      <TransitionSeries.Sequence durationInFrames={150}>
        <Scene2 />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

## Composition notes

- **Width / height are required.** Remotion's `clockWipe()` needs explicit dimensions to compute the rotating clip path. Always pass them from `useVideoConfig()` in the surrounding component.
- **Use sparingly.** The clock-hand sweep is a strong visual; if every cut uses it, scenes start to feel like a slideshow. Reserve for genuine "time passes" or "change of state" moments.
- **House timing applies** — pair with `linearTiming({ durationInFrames: 18, easing: Easing.bezier(0.16, 1, 0.3, 1) })` for the standard rhythm.
