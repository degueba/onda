# iris

A circular reveal that grows from / collapses toward the canvas center, like a camera shutter opening. Classic cinematic effect — the catalog's most "deliberate" cut.

## Options

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `width` | `integer > 0` | ✓ | Canvas width in px. Typically `useVideoConfig().width`. |
| `height` | `integer > 0` | ✓ | Canvas height in px. Typically `useVideoConfig().height`. |

## Usage

```tsx
import { Easing, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { iris } from './components/onda/transitions/iris/iris';

const MyScene = () => {
  const { width, height } = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={150}>
        <Scene1 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={iris({ width, height })}
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

- **Width / height are required.** Remotion's `iris()` needs explicit dimensions to size the radial clip path. Pull them from `useVideoConfig()`.
- **Centered by default.** The current Remotion `iris()` doesn't expose an x/y center (the spec mentioned this as a possible future option but the underlying API doesn't support it today). If off-center iris becomes important, that's a follow-up.
- **Use sparingly.** Like `flip`, iris is loud — reserve for genuine "this beat is the cut" moments.
