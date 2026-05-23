# CameraShake

A wrapper primitive that applies a subtle, decaying camera shake to its `children`. Offsets are derived from Remotion's seeded `random()` keyed off `seed + frame`, so the shake is fully deterministic — the same seed always produces the same motion across renders, threads, and machines. Defaults are deliberately restrained: 4px max offset with decay enabled, so the shake settles into stillness rather than rattling.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | placeholder "shake me" text | Anything you want shaken — usually a scene, image, or text block. |
| `delay` | `integer ≥ 0` | `0` | Frames before the shake starts. |
| `duration` | `integer ≥ 1` | `DURATION.slow` (24) | Frames the shake lasts. Outside this window the offset is zero. |
| `intensity` | `number` | `4` | Max pixel offset on each axis. Keep ≤ 8 for Onda restraint; anything above 12 reads as a violent shake (off-brand). |
| `seed` | `integer` | `0` | Seed for the deterministic PRNG. Bump it to get a different shake pattern with the same other props. |
| `decay` | `boolean` | `true` | If true, intensity falls linearly from full → 0 across `duration`, so the shake settles. If false, it stays at full intensity for the whole window. |

## Usage

```tsx
import { Composition } from 'remotion';
import { CameraShake, cameraShakeSchema } from './components/onda/camera-shake/CameraShake';

export const Root: React.FC = () => (
  <Composition
    id="MyShake"
    component={CameraShake}
    durationInFrames={60}
    fps={30}
    width={1920}
    height={1080}
    schema={cameraShakeSchema}
    defaultProps={{
      delay: 0,
      duration: 24,
      intensity: 4,
      seed: 0,
      decay: true,
    }}
  />
);
```

Compose it around any subtree to give a moment of impact — a stat reveal landing, a logo sting settling, an explosion sound hit:

```tsx
<CameraShake delay={12} duration={20} intensity={4} decay seed={7}>
  <StatCard value={1247} label="creators this week" />
</CameraShake>
```

## Motion notes

- **Deterministic by construction.** Offsets come from Remotion's `random(seed + frame * 2)` and `random(seed + frame * 2 + 1)` — never `Math.random()`, never `Date.now()`, never state. Frame N renders identically regardless of frames 0…N-1.
- **Decay on by default.** `currentIntensity = intensity * (1 - progress)` linearly settles the shake to rest by the end of `duration`. Restraint is the brand: motion that arrives, lands, and stops.
- **Intensity ceiling is a brand guardrail.** Default 4px max offset; values above ~12px stop reading as a cinematic bump and start reading as a violent shake. Stay restrained.
- **Outside the window the wrapper is still.** Before `delay` and after `delay + duration` the transform is `translate(0, 0)` exactly, so the shake is a contained event — content sits perfectly composed at rest.
