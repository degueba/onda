# crossFade

A calm opacity cross-fade between two scenes. The Onda fingerprint — `cubic-bezier(0.16, 1, 0.3, 1)` easing, 18-frame duration — comes from the recommended timing call. The presentation itself is a thin wrapper over Remotion's `fade()`.

## When to use

`crossFade` is the **default transition** in the Onda catalog — the calm choice when you just need to move between two scenes without drawing attention to the cut. Use anywhere a hard cut would feel abrupt and a fancier transition would feel like an effect.

| If you want… | Use |
| --- | --- |
| The two scenes briefly dissolve into each other | **`crossFade`** (default) |
| The new scene rises in over the held outgoing one | **`crossFade`** with `shouldFadeOutExitingScene: false` |
| The cut to drift sideways too | `slide` or `push` |
| The cut to read as emphatic | `zoom` or `blur` |

## Options

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `shouldFadeOutExitingScene` | `boolean` | `true` | When `true`, both scenes fade through each other. When `false`, the outgoing scene holds at full opacity while the incoming scene rises in over it. |

## Usage

Transitions are not React components — they're presentation factories you pass to `<TransitionSeries.Transition>`. The factory composes with Remotion's timing helpers; pass the recommended Onda timing for the house feel:

```tsx
import { Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { crossFade } from './components/onda/transitions/cross-fade/crossFade';

export const MyScene = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={150}>
      <Scene1 />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={crossFade()}
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
```

For a "rise in" variant where the new scene appears over the still-visible outgoing one:

```tsx
<TransitionSeries.Transition
  presentation={crossFade({ shouldFadeOutExitingScene: false })}
  timing={linearTiming({
    durationInFrames: 18,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })}
/>
```

## Composition notes

- **The Onda fingerprint lives in the timing**, not the presentation. The same `crossFade()` with `linearTiming({ easing: linear })` would read as generic. Always pair with the recommended `Easing.bezier(0.16, 1, 0.3, 1)` for the house feel.
- **18-frame duration is the recommended cadence.** Matches `DURATION.base` from `lib/motion.ts` — the same duration most Onda entrances settle to. Keeps the cut in the same rhythm as the scenes themselves.
- **`shouldFadeOutExitingScene` is rarely changed.** The default (true / both scenes fade) is the conventional crossfade behavior. Set false only when you specifically want the "scene rising in over a held outgoing" look — e.g., a logo entrance over a hero image that should stay visible until the logo settles.
- **Per techspec 017**, this transition is intentionally a thin wrap of Remotion's `fade()`. The wrapper exists so Studio + agents have a stable named symbol to dispatch on, and so the README ships the recommended timing in one place. The actual visual algorithm is Remotion's.

## Related

- **`slide`**, **`push`** — directional moves between scenes.
- **`morph`** — crossFade plus a subtle synchronized scale, for a more cinematic cut.
- **`blur`** — extends the BlurReveal fingerprint across a cut.
- **`dipToColor`** — the editing-room classic, dip-to-black or dip-to-white between scenes.
