# Confetti

A celebratory confetti burst — pieces launch from an origin, fan outward, arc under gravity, tumble (rotation), and fade out. Every per-piece value (angle, velocity, spin, color, size) comes from a seeded PRNG keyed off the `seed` prop, and all motion is a pure function of the frame, so the same seed renders identically every time (§1). The default palette is the Onda accent plus tasteful neutrals. This is a full-canvas effect layer — no placement; the burst origin is set with `originX`/`originY` (0..1 fractions). Drop it over your scene with `<AbsoluteFill>`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `seed` | `number` | `7` | Seed for all per-piece randomness (deterministic). |
| `count` | `number` | `80` | Number of confetti pieces. |
| `colors` | `string[]` | accent + neutrals | Palette pieces are picked from. |
| `originX` | `number` | `0.5` | Burst origin X, fraction of canvas width. |
| `originY` | `number` | `0.35` | Burst origin Y, fraction of canvas height. |
| `delay` | `number` | `0` | Frames before the burst launches. |
| `duration` | `number` | `70` | Frames a piece travels, tumbles and fades. |
| `spread` | `number` | `120` | Launch spread in degrees around straight up. |
| `gravity` | `number` | `1` | Downward acceleration multiplier. |
| `pieceSize` | `number` | `12` | Base piece size in pixels. |

## Usage

```tsx
import { AbsoluteFill, Sequence } from 'remotion';
import { Confetti } from './components/onda/confetti/Confetti';

export const Scene = () => (
  <AbsoluteFill style={{ backgroundColor: '#08080A' }}>
    {/* your celebratory content */}
    <Sequence from={24}>
      <Confetti />
    </Sequence>
  </AbsoluteFill>
);
```
