# MeshGradient

A soft mesh-gradient backdrop — colored blobs that drift slowly over the near-black canvas. The drift is a pure function of the frame (sine motion keyed off seeded per-blob phases), so it loops cleanly and renders deterministically (§1). This is a full-canvas atmosphere layer — no placement; drop it behind your scene with `<AbsoluteFill>`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `colors` | `string[]` | rose + soft + border | Blob colors; 2–4 reads best. |
| `background` | `string` | `#08080A` | Canvas color behind blobs. |
| `speed` | `number` | `1` | Drift multiplier — keep low. |
| `seed` | `number` | `7` | Phase seed (deterministic). |
| `opacity` | `number` | `0.5` | Overall blob opacity. |

## Usage

```tsx
import { AbsoluteFill } from 'remotion';
import { MeshGradient } from './components/onda/mesh-gradient/MeshGradient';

export const Scene = () => (
  <AbsoluteFill>
    <MeshGradient />
    {/* foreground content */}
  </AbsoluteFill>
);
```
