# AudioVisualizer

Animated visualization of an audio file — four variants, all driven by the same dB-normalized FFT pipeline and rendered in SVG with Onda's accent treatment (single `color` prop + soft glow).

**Does not play audio.** Pair with a parallel `AudioClip` pointing at the same `src` for audible playback.

## Variants

| Variant | What it shows |
| --- | --- |
| `'bars'` | Frequency-domain bars (spectrum analyzer). Each bar is one FFT bin. |
| `'wave'` | Parametric sine wave whose amplitude is driven by the audio's RMS energy. Always smooth and flowing — the audio drives one scalar, not the shape. |
| `'hills'` | Filled smooth-curve "mountains" mirrored around a centerline. Mid-frequency band drives the bump heights; per-bump variation is seed-deterministic. |
| `'radial'` | Bars arranged in a circle, each driven by a high-frequency FFT bin. Mirrored so the circle reads symmetrically. |

All four use the same dB-normalization (`minDb..maxDb`) so the visual response is perceptually correct — raw FFT magnitudes sit below 0.1 and look dead without this.

## Why it ships as one component (not four)

All four share the same `useAudioData` cache, the same `processFftValue` pipeline, the same Onda accent treatment, and most of the same props. Switching variants is a single prop change. The per-variant props (`bar*`, `wave*`, `hills*`, `radial*`) are namespaced so they don't collide.

## Props

### Universal

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | sample URL | URL or path to the audio file. |
| `variant` | `'bars' \| 'wave' \| 'hills' \| 'radial'` | `'bars'` | Visualization style. |
| `width` | `number` | `640` | Width in px (ignored by `'radial'` — use `radialDiameter`). |
| `height` | `number` | `160` | Height in px (ignored by `'radial'`). |
| `color` | `string` | `"#D96B82"` | Accent color. |
| `glow` | `boolean` | `true` | Soft accent glow via `drop-shadow`. |
| `minDb` | `number` | `-100` | Lower dB bound for FFT normalization. |
| `maxDb` | `number` | `-30` | Upper dB bound. |
| `numberOfSamples` | `integer (power of two)` | `256` | FFT bin count. |
| `placement` | `Placement?` | – | Canvas placement. |

### `'bars'` variant

| Name | Type | Default |
| --- | --- | --- |
| `barWidth` | `number` | `4` |
| `barGap` | `number` | `4` |
| `barRadius` | `number` | `2` |
| `barAlign` | `'top' \| 'middle' \| 'bottom'` | `'middle'` |

### `'wave'` variant

| Name | Type | Default |
| --- | --- | --- |
| `waveSections` | `integer` | `12` |
| `waveLines` | `integer` | `2` |
| `waveLineGap` | `number` | `16` |
| `waveStrokeWidth` | `number` | `2` |
| `waveScrollSpeed` | `number` | `-160` |

### `'hills'` variant

| Name | Type | Default |
| --- | --- | --- |
| `hillsBumps` | `integer` | `8` |
| `hillsCopies` | `integer` | `2` |
| `hillsAlign` | `'top' \| 'middle' \| 'bottom'` | `'middle'` |
| `hillsFillOpacity` | `number 0..1` | `0.4` |
| `hillsStrokeWidth` | `number` | `0` |
| `hillsSeed` | `number \| string` | `42` |

### `'radial'` variant

| Name | Type | Default |
| --- | --- | --- |
| `radialDiameter` | `number` | `360` |
| `radialInnerRadius` | `number` | `80` |
| `radialBarWidth` | `number` | `4` |
| `radialBarGap` | `number` | `4` |
| `radialBarRadius` | `number` | `2` |
| `radialBarOrigin` | `'outer' \| 'inner' \| 'middle'` | `'inner'` |

## Usage

```tsx
import { Composition } from 'remotion';
import { AudioVisualizer, audioVisualizerSchema } from './components/onda/audio-visualizer/AudioVisualizer';

<Composition
  id="Visualizer"
  component={AudioVisualizer}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
  schema={audioVisualizerSchema}
  defaultProps={audioVisualizerSchema.parse({
    src: '/music.mp3',
    variant: 'wave',
  })}
/>
```

Paired with playback (the typical pattern):

```tsx
<AbsoluteFill>
  <AudioClip src="/music.mp3" />
  <AudioVisualizer src="/music.mp3" variant="hills" placement="bottom" />
</AbsoluteFill>
```

## Implementation notes

- **dB normalization is the secret.** `processFftValue(v, minDb, maxDb)` converts raw FFT magnitudes → decibels → 0..1. Without it, almost all bars sit between 0 and 0.1 of canvas height and look dead. Adjust `minDb` / `maxDb` to tune responsiveness for different content.
- **`useAudioData` caches by `src`.** Multiple visualizers on the same audio file share one decode.
- **`'wave'` doesn't render raw audio data.** It's a parametric sine wave; the audio only drives `amplitude` via RMS. Rendering raw amplitude data as a continuous shape pinches to zero at silent samples and looks broken.
- **`'hills'` per-bump variation is deterministic.** Driven by `hillsSeed` via Remotion's `random()`.
- **`'radial'` mirrors the FFT data.** Takes the upper half of the spectrum, mirrors it, so the circle reads symmetrically.

## Inspiration

Visual design ported (technique, not code) from [marcusstenbeck/remotion-audio-visualizers](https://github.com/marcusstenbeck/remotion-audio-visualizers). The signal-processing primitives (`processFftValue`, `getRms`) are standard WebAudio / W3C patterns reimplemented from scratch for our MIT-licensed catalog.
