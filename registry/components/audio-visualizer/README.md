# AudioVisualizer

Renders an animated visualization of an audio file — bars (frequency-domain) or a waveform (time-domain). **Does not play audio.** Visualization and playback are independent concerns; a typical scene has both an `AudioVisualizer` (shows) and an `AudioClip` (plays) pointing at the same `src`.

## When to use

| If you want… | Use |
| --- | --- |
| Visible bars on top of music | **`AudioVisualizer`** (`variant: 'bars'`) + parallel `AudioClip` |
| A waveform under VO | **`AudioVisualizer`** (`variant: 'waveform'`) + parallel `AudioClip` |
| Play audio without showing anything | **`AudioClip`** alone |

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | sample URL | URL or path. The same `src` an `AudioClip` plays — `useAudioData` caches by URL, so multiple visualizers share one decode. |
| `variant` | `'bars' \| 'waveform'` | `'bars'` | `'bars'` is frequency-domain (FFT); `'waveform'` is time-domain (amplitude). |
| `numberOfSamples` | `integer (power of two)` | `32` | FFT bin count for `'bars'`. Validated by Zod. 32 is the perceptual sweet spot; raise past 128 only with `optimizeFor: 'speed'`. |
| `smoothing` | `boolean` | `true` | 3-frame symmetric averaging across bins for less jittery bars. Disable for raw FFT amplitudes. |
| `optimizeFor` | `'accuracy' \| 'speed'` | `'accuracy'` | `'speed'` is recommended for Lambda renders and high sample counts. |
| `color` | `string` | `"#D96B82"` | Bar / waveform color. Defaults to `--onda-accent` — visualizations are an earned-color moment. |
| `placement` | `Placement?` | – | Where on the canvas this sits. Defaults to centered. |
| `width` | `number?` | – | Width in px. When omitted, the visualizer fills its placement box. |
| `height` | `number` | `80` | Height in px. |
| `barGap` | `number ≥ 0` | `4` | Gap between bars (only `variant: 'bars'`). |
| `barRadius` | `number ≥ 0` | `2` | Border radius for bars (only `variant: 'bars'`). |
| `waveformStrokeWidth` | `number ≥ 0.5` | `2` | Stroke width for the waveform line (only `variant: 'waveform'`). |

## Usage

```tsx
import { AbsoluteFill, Sequence } from 'remotion';
import { AudioClip } from './components/onda/audio-clip/AudioClip';
import { AudioVisualizer } from './components/onda/audio-visualizer/AudioVisualizer';

export const Scene: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={240}>
      {/* plays */}
      <AudioClip src="/music.mp3" startAt={0} endAt="0:08" volume={0.6} />
      {/* shows */}
      <AudioVisualizer src="/music.mp3" variant="bars" placement="bottom" />
    </Sequence>
  </AbsoluteFill>
);
```

### Waveform variant (under voiceover)

```tsx
<AudioVisualizer
  src="/voiceover.mp3"
  variant="waveform"
  placement="bottom"
  width={960}
  height={120}
  waveformStrokeWidth={3}
/>
```

## Composition notes

- **No playback.** Don't try to add a `play` prop — the right pattern is a separate `AudioClip`. Conflating them would force every scene that wants playback to also pay for FFT analysis (and every visualizer to compete for the audio output device).
- **Cache by `src`.** `useAudioData(src)` decodes the audio once per URL per session. Multiple visualizers on the same `src` share that decode — call `useAudioData` inside the component, not via props.
- **Power-of-two `numberOfSamples`.** Validated by the schema. 32 is the visual sweet spot for typical canvas widths; 64 reads as more detail; >128 should pair with `optimizeFor: 'speed'`.
- **Smoothing is on by default.** Disable for raw FFT amplitudes (waveform analysis, beat detection); leave on for visible bars.
- **For audio > 5 minutes**, the windowed variant (`useWindowedAudioData`) avoids loading the entire file into memory. Not exposed in v1 — add a separate `AudioVisualizerWindowed` if a real composition needs it.
- **Async loading.** While `useAudioData` is fetching, the component renders an empty placeholder at the configured dimensions so layout doesn't jump. Same dimensions during SSR.
- **Waveform is a single SVG polyline.** Smooth, scalable, deterministic. Mapped from `visualizeAudioWaveform`'s sample array (`v - 0.5` centers ±height/2 around the middle line). For multi-channel / stereo visualization, ship `AudioVisualizerStereo` later — current spec sums to mono.
