# Media & audio

How to render user-supplied photos, video, and audio with the Onda contract. Part of the [Composing with Onda](/docs/composing-with-onda) reference.

These components render user-uploaded or hosted media. `src` is passed through verbatim — Onda doesn't host; the caller provides whatever URL their asset store serves.

**Critical rule:** when you need to render a user-supplied photo, video clip, or audio file, **always reach for `ImageReveal` / `VideoClip` / `AudioClip` first**. Bare `<Img>` / `<OffthreadVideo>` / `<Html5Audio>` work, but they don't carry the Onda contract — manual frame math, no consistent fade semantics, no agent-friendly time-string trim. `KenBurns` and `Parallax` exist for *specific sustained motions* (continuous zoom-pan / drift), not for general-purpose photo display.

## Picking the right media component

| If you want… | Use | Don't use |
| --- | --- | --- |
| Show a photo with an Onda entrance, then hold it | **`ImageReveal`** (any `motion` variant) | `KenBurns` (forces zoom-pan), `Parallax` (forces drift), bare `<Img>` (no fingerprint) |
| Show a photo with continuous slow zoom-and-pan (documentary feel) | **`KenBurns`** | `ImageReveal` (no sustained motion) |
| Show a photo with continuous linear drift (no zoom) | **`Parallax`** | `ImageReveal`, `KenBurns` |
| Play a trimmed video clip with Onda fade-in/out | **`VideoClip`** | Bare `<OffthreadVideo>` (no fingerprint, manual frame math) |
| Loop a video as a background plate | **`VideoClip`** with `loop`, `muted`, `fade={false}` | Bare `<OffthreadVideo loop>` |
| Crossfade between two video beats | **`VideoClip`** inside `<TransitionSeries>` with `fade={false}` per clip | `VideoClip` with default fade (would double-fade) |
| Play a voiceover, music bed, or SFX | **`AudioClip`** | Bare `<Html5Audio>` (no fade envelope, no time-string trim, no dB) |
| Loop a music bed | **`AudioClip`** with `loop`, `endAt`, lower `volume`, larger `fadeDuration` | Bare `<Html5Audio loop>` |
| Show animated bars or a waveform | **`AudioVisualizer`** + parallel `AudioClip` | `AudioVisualizer` alone (it doesn't play audio) |

The categories are complementary: `ImageReveal` owns *entrances*, `KenBurns` / `Parallax` own *sustained motion across a held image*. Ken Burns-ing every photo because it's the only image component the agent remembered makes every scene feel like a documentary slideshow.

## `ImageReveal`
An image that enters with one of Onda's signature motion fingerprints — `'blur'` (BlurReveal's fingerprint applied to images), `'fade'` (opacity only), or `'scale'` (subtle 0.95 → 1, no overshoot). All variants drive on `SPRING_SMOOTH`. After the entrance, the image holds static.
- Key props: `src`, `alt`, `delay`, `duration`, `motion` (`'blur' | 'fade' | 'scale'`), `fit` (`'cover' | 'contain'`), `placement`, `width`, `height`, `borderRadius`.
- **Default `motion: 'blur'`** carries the strongest Onda fingerprint. Use `'fade'` for quieter background reveals; `'scale'` when the image is a focal element.

## `VideoClip`
A video clip with agent-friendly trim, Onda's entrance/exit fade, and optional looping. Wraps `<OffthreadVideo>`. `startAt` / `endAt` accept the time-string vocabulary (`"0:04"`, `"30s"`, `"500ms"`, raw seconds), resolved via `toFrames()`.
- Key props: `src`, `delay`, `startAt`, `endAt`, `fade` (boolean), `fadeDuration`, `muted`, `volume`, `loop`, `fit`, `placement`, `width`, `height`, `borderRadius`.
- **`loop` requires `endAt`** (interval is `endAt - startAt`). **Loop disables fade-out.**
- **Inside `<TransitionSeries>`, set `fade={false}`** so the transition owns the crossfade.

## `AudioClip`
The workhorse audio primitive — a single audio file with agent-friendly trim, an opt-in fade envelope (default 2-frame click-guard), optional looping, and a dB-or-amplitude volume contract. Wraps `<Html5Audio>`. Used for music beds, voiceover, and SFX equally.
- `placement`: no (audio is invisible) · Key props: `src`, `startAt`, `endAt`, `volume` (0..1) or `gainDb`, `fade`, `fadeDuration`, `loop`, `muted`, `playbackRate`.
- **`loop` requires `endAt`.** Looping disables fade-out.
- **dB and amplitude both exposed** — `gainDb` wins when both set. `amplitude = 10 ** (dB / 20)`.
- **No `delay`** — sequencing is the parent `<Sequence from={…}>`'s job (or the `at` field in a Composition payload).

## `AudioVisualizer`
An animated visualization of an audio file — bars (FFT) or a waveform. **Does not play audio.** Pair with a parallel `AudioClip` on the same `src`. Uses `useAudioData` (cached per `src`).
- `placement`: yes · Key props: `src`, `variant` (`'bars' | 'waveform'`), `numberOfSamples` (power of two), `smoothing`, `optimizeFor`, `color`, `placement`, `width`, `height`.
- **Power-of-two `numberOfSamples`** — 32 is the sweet spot; >128 should pair with `optimizeFor: 'speed'`.

## `KenBurns`, `Parallax`
Specialized image-with-motion. **Their job is sustained motion, not entrance** — the photo is present from frame 0 (no fade-in), then the "camera" moves continuously and linearly.
- `KenBurns` — slow zoom + pan, default 1.0 → 1.1 over ~5s. Intentionally linear.
- `Parallax` — steady horizontal/vertical drift (no zoom).
- Reach for these *only* when the named effect is wanted. "Show this photo" → `ImageReveal`, not `KenBurns`.

## Media composition pattern

A background photo (Ken Burns drift) with foreground beats sequenced over it:

```tsx
import { Series, AbsoluteFill } from 'remotion';
import { toFrames } from '@/lib/timing';

<AbsoluteFill>
  {/* Background — KenBurns owns the sustained zoom-pan, present from frame 0. */}
  <KenBurns src="/backdrop.jpg" toScale={1.08} />

  {/* Foreground — each beat enters with the Onda fingerprint */}
  <Series>
    <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
      <ImageReveal src="/intro.jpg" motion="blur" placement="center" width={720} height={480} borderRadius={12} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={toFrames('0:05', fps)}>
      <VideoClip src="/feature.mp4" startAt="0:02" endAt="0:07" placement="center" width={720} height={480} borderRadius={12} />
    </Series.Sequence>
  </Series>
</AbsoluteFill>
```

Media that should fill the canvas (background plates, hero photos) is dropped in **without** `placement`; media that should be inset gets `placement` plus explicit `width` / `height`.

## Audio composition patterns

Audio sits alongside visual primitives in the same `<Sequence>` timeline. The patterns differ by *use case*, not by component.

**Music bed (looping, low volume, audible fade)**
```tsx
<AudioClip src="/bed.mp3" loop startAt={0} endAt="0:30" volume={0.4} fadeDuration={45} />
```

**Voiceover (one clip per line)**
```tsx
<Series>
  <Series.Sequence durationInFrames={toFrames('0:04', fps)}>
    <AudioClip src="/vo-1.mp3" startAt="0:00" endAt="0:04" />
  </Series.Sequence>
  <Series.Sequence durationInFrames={toFrames('0:03', fps)}>
    <AudioClip src="/vo-2.mp3" startAt="0:00" endAt="0:03" />
  </Series.Sequence>
</Series>
```

**Visible bars + audible music (same `src`)**
```tsx
{/* useAudioData caches by src — both share one decode. */}
<AudioClip src="/music.mp3" startAt={0} endAt="0:08" volume={0.6} />
<AudioVisualizer src="/music.mp3" variant="bars" placement="bottom" width={960} height={120} />
```

**Format hints**
- **WAV** for transients < 500ms (clicks, taps) — zero decode overhead, no leading silence.
- **AAC in MP4** for everything else (beds, VO, longer SFX).
- **Avoid MP3** when AAC is available (~50ms encoder-injected leading silence, audible on percussive SFX).
- **OGG/Vorbis** lacks reliable Safari/iOS support.

## What these media components don't do

- **No automatic media + caption composition.** Compose `ImageReveal` + `WordStagger` manually if a caption is needed.
- **No upload / storage / signed-URL management.** `src` is a verbatim URL — the caller handles lifecycle.
- **No sustained motion over an `ImageReveal`.** Use `KenBurns` / `Parallax` for that.
- **No load placeholder.** Caller's concern.
