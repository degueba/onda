# AudioClip

The workhorse audio primitive: a single audio file with agent-friendly trim, an opt-in fade envelope, optional looping, and a dB-or-amplitude volume contract. Used for music beds, voiceover, and SFX equally — patterns differ, the component doesn't.

Wraps Remotion's `<Html5Audio>` (current official recommendation per Remotion docs).

## When to use

`AudioClip` is the **default audio primitive** in the catalog — reach for it for any audio file in an Onda composition. It carries the time-string trim vocabulary the rest of the media catalog uses, adds the Onda click-guard fade by default, and exposes volume in both amplitude (0..1) and dB so agents and sound designers both have an idiomatic prop.

| If you want… | Use |
| --- | --- |
| Play a voiceover, music bed, or SFX | **`AudioClip`** (this component) |
| Loop a music bed | **`AudioClip`** with `loop`, `endAt` set, `volume: 0.3–0.6`, larger `fadeDuration` |
| Duck the music under VO | **`AudioClip`** for both, author the duck on the bed via `volume` callback at composition time |
| Visualize an audio file without playing it | **`AudioVisualizer`** (separate component) |

`AudioVisualizer` does **not** play audio — pair it with a parallel `AudioClip` pointing at the same `src` when you want both visible bars and audible playback.

## Props

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | sample URL | URL or path to the audio file. AAC-in-MP4 or WAV preferred (see format hints below). |
| `startAt` | `string \| number` | `0` | Where to start in the **source audio**. Time spec — `"0:04"`, `"30s"`, `"500ms"`, `"90f"`, or raw seconds. |
| `endAt` | `string \| number?` | – | Where to stop in the source. When omitted, plays to the end. Required for `loop: true`. |
| `volume` | `number 0..1` | `1` | Amplitude volume. |
| `gainDb` | `number?` | – | Advanced override in dB. When set, wins over `volume`. Converted via `10 ** (dB / 20)`. -6 dB ≈ 0.5, -12 dB ≈ 0.25, -20 dB ≈ 0.1. |
| `fade` | `boolean` | `true` | Apply an entry/exit volume envelope. Default is a tiny 2-frame click-guard — imperceptible to ears, prevents start/end pops. |
| `fadeDuration` | `integer ≥ 0` | `2` | Frames the fade-in / fade-out takes. ~67ms at 30fps. Bump to 30–60 for audible bed fades. |
| `loop` | `boolean` | `false` | Loop the trimmed clip. Requires `endAt`. Disables fade-out (no defined end). |
| `muted` | `boolean` | `false` | Mute the clip. |
| `playbackRate` | `number 0.0625..16` | `1` | Browser-clamped playback speed. |
| `acceptableTimeShiftSeconds` | `number ≥ 0` | `0.1` | Drift threshold before Remotion resyncs. Tighter than Remotion's 0.45 default — Onda compositions are beat-locked. |

## Usage

```tsx
import { Composition } from 'remotion';
import { AudioClip, audioClipSchema } from './components/onda/audio-clip/AudioClip';

export const Root: React.FC = () => (
  <Composition
    id="Voiceover"
    component={AudioClip}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
    schema={audioClipSchema}
    defaultProps={{
      src: '/voiceover.mp3',
      startAt: '0:02',
      endAt: '0:08',
      volume: 1,
      fade: true,
      fadeDuration: 2,
      loop: false,
      muted: false,
      playbackRate: 1,
      acceptableTimeShiftSeconds: 0.1,
    }}
  />
);
```

### Music bed (looping)

```tsx
<AudioClip src="/bed.mp3" loop startAt={0} endAt="0:30" volume={0.4} fadeDuration={45} />
```

### SFX (sprite-sliced from a single file)

```tsx
<AudioClip src="/sfx-library.wav" startAt="0:01.250" endAt="0:01.500" volume={0.8} />
```

## Composition notes

- **Wraps `<Html5Audio>`** — Remotion's current official recommendation for audio (per their docs). `<OffthreadAudio>` doesn't exist; the future replacement is `@remotion/media`'s `<Audio>` (experimental), which `AudioClip`'s internals will swap to without changing this prop surface.
- **Volume callback, not numeric volume.** Internally `AudioClip` passes `volume={(clipFrame) => …}` to `<Html5Audio>`. This lets Remotion draw the volume curve in Studio AND avoids per-frame re-renders. The callback's `clipFrame` is **clip-local** (starts at 0 when the clip begins), not composition-frame.
- **dB and amplitude both expressed.** Sound designers think in dB; agents pick 0..1 from a UI. When both are passed, `gainDb` wins. The component converts via `amplitude = 10 ** (dB / 20)`.
- **Default 2-frame click-guard fade.** Lossy codecs frequently introduce a tiny click at clip start/end; the default envelope smooths it out below the audibility threshold. Set `fadeDuration: 30–60` for audible bed fades, or `fade: false` only inside a crossfade primitive that owns the envelope.
- **Loop requires `endAt`.** The loop interval is `endAt - startAt`. Without `endAt` there's no interval, so `loop: true` is silently a no-op. Fade-out is auto-disabled when looping — no defined end frame from the clip's perspective until the parent `<Sequence>` terminates. To fade out a looping bed, wrap it in a `<Sequence durationInFrames={N}>` and add a parent opacity / volume envelope.
- **Time specs via `toFrames` from `lib/timing.ts`** — same vocabulary as `VideoClip` / Composition payloads. `"0:04"`, `"30s"`, `"500ms"`, `"90f"`, or a raw number of seconds. Resolution to Remotion's frame-count props happens internally against `useVideoConfig().fps`.
- **No internal `<Sequence>`.** AudioClip is placed via the parent `<Sequence from={…}>` like every other Onda primitive — keeps the timeline-payload pattern consistent (`{ at, for, component: "AudioClip", props: {…} }`).

## Format hints

- **WAV** for transients < 500ms (clicks, pops, button taps). Zero decode overhead, no leading silence.
- **AAC in MP4** for everything else (beds, VO, longer SFX). Hardware-decoded on most devices, no leading-silence padding.
- **Avoid MP3** when AAC is available — ~50ms of encoder-injected silence at the start, audible on percussive SFX.
- **OGG/Vorbis** works but lacks reliable Safari/iOS support — avoid for cross-browser libraries.
