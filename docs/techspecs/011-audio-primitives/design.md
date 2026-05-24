# Techspec 011 — Audio primitives

## Problem

The catalog ships zero audio components. Studio's [asset palette](../../../onda-studio/docs/techspecs/003-asset-palette-ui/design.md) supports audio uploads as a first-class type (music beds, voiceover, sound effects), but neither the agent nor the lib has a way to render them. Today the only options are:

- Drop down to Remotion's `<Audio>` / `<Html5Audio>` directly — works, but loses every Onda affordance: no agent-friendly time-string trim, no consistent fade semantics, no validated dB/volume contract, no sound-design conventions baked in.
- Skip audio entirely — which means Studio's uploaded audio assets are unusable in any rendered composition.

The product gap: an Onda composition that includes user-uploaded media cannot include the *sound* of that media. A user uploading a product demo with voiceover gets the video clip on screen and silence underneath.

The lib gap: there's no place to centralize the audio-specific performance rules (sample-count defaults, smoothing, sprite-sheet vs single-file tradeoffs, dB↔amplitude conversion, format hints) that a competent sound designer or an LLM agent needs to compose audio correctly.

## Research findings (verified against Remotion docs)

Captured here so the design is grounded in fact, not assumption. Sources at the bottom.

- **Three audio component options exist in Remotion today.** `<Html5Audio>` (current official recommendation), `<Audio>` (the older default), and `<Audio>` from `@remotion/media` (Mediabunny-based, experimental, the *intended* future replacement). Per Remotion's own guidance: *"our recommendation is still to use `<OffthreadVideo>` for videos and `<Html5Audio>` for audio."*
- **No `<OffthreadAudio>` exists.** The conceptual equivalent is `@remotion/media`'s `<Audio>` — once stable, that's what we'll swap to.
- **Volume callbacks (`volume={(f) => …}`) are the recommended pattern** for time-varying volume. Remotion docs explicitly call out: enables a visible volume curve in the Studio AND is more performant than per-frame re-renders with a numeric `volume`. The callback's `f` is clip-local (starts at 0 when the clip begins), not composition-frame.
- **`<Html5Audio>`'s `acceptableTimeShiftInSeconds` defaults to 0.45s** — quite loose. For beat-locked SFX or sync-critical work the default is too generous; lower it explicitly per-component.
- **Trim props renamed.** Modern: `trimBefore` (was `startFrom`) and `trimAfter` (was `endAt`). Old names are deprecated.
- **`useAudioData(src)` caches by URL in process memory** — one decode per src per session for visualization. Cache is cleared on page reload. Throws if file has no audio track (v4.0.75+). Remote requires CORS.
- **Playback uses separate per-instance elements**, not the cache. Visualization sharing ≠ playback sharing. Two `<AudioClip src="X">` instances each create their own HTML audio element / Mediabunny stream.
- **`visualizeAudio`'s `numberOfSamples` must be a power of two** (32, 64, 128…). It's the FFT bin count. `smoothing: true` (default) does a fixed 3-frame average (prev/current/next) — not a configurable count. `optimizeFor: 'speed'` uses a faster FFT, recommended for Lambda and high sample counts.
- **`useWindowedAudioData`** is the right tool for long audio (15min+): HTTP range requests, 3-window rolling buffer (prev/current/next), avoids loading the whole file.
- **Sprite-sheet wins are smaller than expected in Remotion specifically.** Network round-trips don't dominate when assets ship via `staticFile()`. Sprites help with decode-cache cohesion and fewer HTTP requests, not raw perf. Don't oversell.
- **Codec tradeoff:** WAV for <500ms transients (no decode overhead), AAC (in MP4) for everything else (hardware decode on most devices, no leading silence). MP3 has ~50ms leading-silence padding from the encoder; prefer AAC.
- **No built-in audio mixing semantics in Remotion docs.** Multiple `<Audio>` tags compose by summing through the audio pipeline; behavior must be verified empirically.
- **Web Audio API has no built-in sidechain ducking.** Implementation pattern: author the duck envelope as a frame-callback `volume` curve on the music bus — visible in Studio, no Web Audio plumbing.
- **dB ↔ amplitude:** `amplitude = 10 ** (dB / 20)`. -6 dB ≈ 0.5, -12 dB ≈ 0.25, -20 dB ≈ 0.1. Standard SFX duck cut: 4–6 dB. Standard VO duck cut: 8–12 dB.

## Decision

Ship two primitives plus a documented set of performance rules and use patterns. Match the structure that worked for 010 (one workhorse primitive + one specialized; clear "when to use" matrix).

### 1. `AudioClip` — the workhorse audio primitive

A single audio file with agent-friendly trim, an opt-in fade envelope, optional looping, and a dB-or-amplitude volume contract. Used for music beds, voiceover, and sound effects equally — the use cases differ in *patterns*, not in component.

```ts
export const audioClipSchema = z.object({
  /** URL or path to the audio file. */
  src: z.string(),
  /**
   * Trim — where to start in the SOURCE audio. Time spec
   * (`"0:04"` / `"30s"` / `"500ms"` / `"90f"` / raw seconds).
   * Maps to `<Html5Audio trimBefore={toFrames(startAt, fps)}>`.
   */
  startAt: timeSpec.default(0),
  /**
   * Trim — where to end in the source. When omitted, plays to source end.
   * Maps to `trimAfter`.
   */
  endAt: timeSpec.optional(),
  /** Amplitude volume (0..1). Default 1. */
  volume: z.number().min(0).max(1).default(1),
  /**
   * Advanced override: gain in dB. When set, wins over `volume`. Sound
   * designers think in dB; agents picking from a UI pick 0..1. The
   * component converts via `10 ** (dB / 20)` at render time.
   */
  gainDb: z.number().optional(),
  /**
   * Click/pop avoidance + opt-in audible fade. Default `true` with a tiny
   * 2-frame fade — imperceptible to ears, prevents start/end clicks. Set
   * larger `fadeDuration` for beds; set `fade: false` to disable entirely
   * (rare; only inside crossfade primitives).
   */
  fade: z.boolean().default(true),
  /** Frames the fade-in / fade-out takes. Default 2 (~67ms @ 30fps). */
  fadeDuration: z.number().int().min(0).default(2),
  /**
   * Loop the trimmed clip. Requires `endAt` to be set (loop interval is
   * `endAt - startAt`). When looping, fade-out is auto-disabled.
   */
  loop: z.boolean().default(false),
  /** Mute the clip. */
  muted: z.boolean().default(false),
  /** Playback speed. Browser-clamped 0.0625..16. */
  playbackRate: z.number().min(0.0625).max(16).default(1),
  /**
   * Acceptable time-shift threshold before Remotion resyncs (seconds).
   * Default `0.1` — tighter than Remotion's own 0.45 default because
   * Onda compositions are usually beat-locked.
   */
  acceptableTimeShiftSeconds: z.number().min(0).default(0.1),
});
```

Backed by **`<Html5Audio>` from `remotion`** (current official recommendation). Time-string trim resolved via `toFrames(value, fps)`. Volume implemented as a callback function `volume={(clipFrame) => …}` so the fade envelope, dB conversion, and loop-aware fade-out all live in one place and Remotion can draw the volume curve in Studio.

No internal `<Sequence>` — `AudioClip` is placed via the parent `<Sequence from={…}>` like every other Onda primitive. This keeps the timeline-payload pattern consistent (`{ at, for, component: "AudioClip", props: {…} }`).

### 2. `AudioVisualizer` — the visible primitive

Renders an animated visualization of an audio file — bars (frequency-domain) or waveform (time-domain). **Does not play audio.** Visualization and playback are independent concerns; a typical scene has both `AudioClip` (plays) and `AudioVisualizer` (shows) pointing at the same `src`.

```ts
export const audioVisualizerSchema = z.object({
  /** URL or path. Same `src` as the parallel `AudioClip` typically plays. */
  src: z.string(),
  /** Visualization variant. `'bars'` is frequency-domain; `'waveform'` is time-domain. */
  variant: z.enum(['bars', 'waveform']).default('bars'),
  /**
   * FFT bin count for `bars`. MUST be a power of two (32, 64, 128…).
   * 32 is the default — sweet spot for visual smoothness vs perf. Refer
   * to "Performance rules" before raising past 128.
   */
  numberOfSamples: z.number().int().refine(isPowerOfTwo).default(32),
  /**
   * Whether to 3-frame-average the data (prev/current/next). Default `true`
   * for less jittery visualization. Boolean — not a configurable count
   * (Remotion's API constraint).
   */
  smoothing: z.boolean().default(true),
  /** `'accuracy'` (default) | `'speed'`. Use `'speed'` for Lambda / high sample counts. */
  optimizeFor: z.enum(['accuracy', 'speed']).default('accuracy'),
  /** Bar / waveform color. Defaults to `--onda-accent` — visualizations are an earned-color moment. */
  color: z.string().default('#D96B82'),
  /** Where on the canvas this sits. Region or `{ x, y, anchor }`. Defaults to centered. */
  placement: placementSchema.optional(),
  /** Width in px. */
  width: z.number().optional(),
  /** Height in px. */
  height: z.number().default(80),
});
```

Uses `useAudioData(src)` (cached per src) + `visualizeAudio({frame, fps, audioData, numberOfSamples, smoothing, optimizeFor})` (for bars) or `visualizeAudioWaveform()` (for waveform). Renders bars as SVG rects positioned via `<PlacementBox>` — same canvas-aware vocabulary as the rest of the catalog.

For very long audio (>5 minutes), defer to a future `AudioVisualizerWindowed` that wraps `useWindowedAudioData`. Most compositions don't need it.

### Backend choice — `<Html5Audio>` for now, abstraction-free

The temptation: build a `<OndaAudio>` shim that wraps `<Html5Audio>` today and can swap to `@remotion/media`'s `<Audio>` later. Reject this — premature abstraction. `AudioClip` *is* the shim; if the underlying Remotion component changes, we refactor `AudioClip`'s internals without changing its prop surface. One wrapper, not two.

When `@remotion/media`'s `<Audio>` graduates from experimental, refactor `AudioClip`'s implementation. Consumers see no change.

## Performance rules

Codify these in the spec so every audio component author follows them and every consumer (especially agents) sees them in `docs/composing-with-onda.md`.

### Audio rendering

1. **`<Html5Audio>` is the default backend** (per Remotion's current guidance). Document the future swap to `@remotion/media`'s `<Audio>` as an internal refactor, not an API change.
2. **Use the volume callback (`volume={(f) => …}`), not numeric volume**, when the value varies. Lets Studio draw the curve and avoids per-frame re-renders.
3. **Lower `acceptableTimeShiftInSeconds` to `0.1`** (vs Remotion's 0.45 default) for Onda components. Beat-locked work doesn't tolerate half-second drift.
4. **Default tiny click-guard fade** (2 frames, ~67ms). Imperceptible; prevents start/end pops. Larger `fadeDuration` for beds is opt-in.
5. **Loop requires `endAt`.** Without it, the loop interval is undefined. Documented in the schema and called out in agent docs.
6. **Loop disables fade-out** (no defined end). Document the workaround: wrap in a `<Sequence durationInFrames={N}>` and add the fade via the parent.

### Audio visualization

7. **`useAudioData(src)` caches by URL.** Multiple `AudioVisualizer` instances on the same `src` share one decode. The rule for component authors: call `useAudioData` inside the component, not via props. Passing data via props bypasses the cache.
8. **`numberOfSamples` defaults to `32`.** Sweet spot. Document that values must be power of two and that >128 should use `optimizeFor: 'speed'`.
9. **Smoothing on by default** (`smoothing: true` — Remotion's 3-frame average). Components that need raw amplitudes (waveform timing analysis) explicitly opt out.
10. **`useWindowedAudioData` for audio >5 minutes.** Avoids loading the full file into memory. Out of scope for the v1 primitives; document as the future scaling path.

### Format hints

11. **WAV for transients < 500ms** (clicks, pops, taps). Zero decode overhead.
12. **AAC in MP4 for everything else** (beds, VO, longer SFX). Hardware-decoded on most devices, no leading-silence padding.
13. **Avoid MP3** when AAC is available — ~50ms of encoder-injected silence at the start, audible on percussive SFX.
14. **OGG/Vorbis works but lacks reliable Safari/iOS support** — avoid for cross-browser libraries.

### Composition patterns (use-case recipes)

#### Music bed pattern
- One `AudioClip` per bed track.
- `loop: true` (with `endAt` matching the loop point), `volume: 0.3–0.6` typical.
- `fade: true`, `fadeDuration: 30–60` (1–2s audible fade on bed entry/exit).
- Optional: parallel `AudioVisualizer` for visible music presence.

#### Voiceover pattern
- One `AudioClip` per VO line, sequenced inside `<Sequence>` beats.
- `volume: 1`, `fade: true`, tiny default 2-frame click-guard is enough.
- Music ducks via volume callback on the *bed's* AudioClip: `volume={(f) => isVoActive(f) ? 0.15 : 0.5}`.

#### SFX pattern
- Multiple `AudioClip` instances, each gated by a `<Sequence from={frames} durationInFrames={…}>`.
- `volume: 0.6–1.0` typical (SFX are mixed creative).
- `fade: true` (default) covers click-guard; usually no audible fade needed.
- For SFX libraries (one file containing many effects at known time offsets), use `startAt` / `endAt` to slice the sprite — one decode, many slices.

#### Visualizer pattern
- `AudioVisualizer` placed at desired canvas position; same `src` as the `AudioClip` that plays the audio.
- `placement: 'bottom'` and `width: '60%'` (or equivalent) for unobtrusive metering.
- Use `'waveform'` variant for narrative-aligned audio (VO, speech); `'bars'` for music (frequency content).

## Goals

1. Any user-uploaded audio asset (bed, VO, SFX) renders with one Onda payload, no manual frame math.
2. Audio components fully participate in the 008 vocabulary (`placement` works for the visualizer; `width`/`height` for sizing).
3. `AudioClip` accepts the timeline-payload pattern (`{ at, for, component: "AudioClip", props: {…} }`) and is sequenced by the parent `<Sequence>`.
4. dB and amplitude both expressed; agents pick 0..1, sound designers pick dB.
5. Performance rules documented in spec + `composing-with-onda.md` so agents follow good practice by default.
6. No reinvention of audio decoding, mixing, or rendering — wraps Remotion's `<Html5Audio>` and `@remotion/media-utils` per [[remotion-built-ins-first]].

## Non-goals

- **Audio editing / waveform trimming UI.** The agent / caller picks `startAt` / `endAt` values; lib doesn't ship a UI.
- **Real-time sidechain ducking.** Web Audio API doesn't have it built in. The recommended pattern is volume-callback envelopes authored at composition time, which doesn't need a primitive.
- **Multi-channel routing / surround.** Stereo only.
- **Audio effects (reverb, EQ, compression).** Out of scope; if needed, do at content-prep time before upload.
- **`AudioVisualizerWindowed`** for >5min audio. Document as the scaling path; ship only when concrete demand appears.
- **Spritesheet-pack manifest format.** Sprite use is documented as a pattern (use `startAt` / `endAt` slices on a single file); no manifest format needed.
- **`@remotion/media`'s `<Audio>` as the v1 backend.** Experimental per Remotion's own docs; refactor internally when stable.

## Reasonable calls (challenge any)

- **`AudioClip` is general-purpose, not three semantic primitives.** `<AudioBed>` / `<Voiceover>` / `<SoundEffect>` would all wrap `<Html5Audio>` identically; the use cases differ in *patterns* (loop, fade duration, sequencing density), not in component shape. One workhorse + documented patterns beats three near-duplicate components.
- **`fade: true` default with a 2-frame click-guard.** Audible fades are opt-in via larger `fadeDuration`; the default just prevents the click most lossy codecs introduce at file start/end. Imperceptible to ears, prevents real artifacts.
- **`acceptableTimeShiftSeconds` defaulted to `0.1`** (vs Remotion's `0.45`). Onda compositions are beat-locked; half a second of drift is too much. Per-component override available for unusual cases.
- **dB and amplitude both exposed, dB wins when both passed.** Sound designers think in dB; agents pick 0..1 from UIs. Conflating them or forcing one is worse than letting both exist with a clear precedence rule.
- **`AudioVisualizer` does NOT play audio.** Pairing a visualizer with a separate `AudioClip` is the explicit pattern. Conflating them would force every "I want to play audio" to also include visualization weight, even when invisible.
- **Default `numberOfSamples: 32`.** Docs example uses 16 (bar chart); 32 is the perceptual sweet spot for typical canvas sizes. Power-of-two constraint enforced by Zod refine.
- **`<Html5Audio>` over the experimental `@remotion/media` `<Audio>`** for v1. Remotion's own guidance. Refactor internals later without API change.

## Open questions deferred

- **Should `AudioClip` accept a `playOnce: boolean` for one-shot SFX semantics?** Currently any AudioClip plays for its duration; multiple instances of the same `src` play in parallel. A `playOnce` mode would dedupe within a window. Defer — pattern is rare and easy to recreate at the caller.
- **`AudioVisualizer` for stereo (separate left/right channels)?** Current spec sums to mono. Stereo visualization is niche; defer.
- **A `useDecodedAudio(srcs[])` helper for pre-decoding** a list of SFX files at mount time, eliminating first-playback decode stalls? Useful for SFX-heavy compositions. Defer until concrete demand from a real composition.
- **Should `AudioClip` expose `playbackRate` as a *callback* function** (time-varying speed for tape-stop / wow effects)? Possible; Remotion supports it. Niche; defer.
- **`AudioVisualizer.variant: 'pulse'`** — a single circle/bar that scales with overall amplitude, no per-frequency bars. Simpler, cute. Add if a real scene demands it.

## Sources

- [Remotion Html5Audio](https://www.remotion.dev/docs/html5-audio)
- [Remotion Audio (@remotion/media)](https://www.remotion.dev/docs/media/audio)
- [Remotion volume callbacks](https://www.remotion.dev/docs/audio/volume)
- [Remotion media-utils](https://www.remotion.dev/docs/media-utils)
- [Remotion useAudioData](https://www.remotion.dev/docs/use-audio-data) · [getAudioData](https://www.remotion.dev/docs/get-audio-data)
- [Remotion visualizeAudio](https://www.remotion.dev/docs/visualize-audio) · [Visualization best practices](https://www.remotion.dev/docs/audio/visualization)
- [Remotion useWindowedAudioData](https://www.remotion.dev/docs/use-windowed-audio-data)
- [Remotion Mediabunny / new tags](https://www.remotion.dev/docs/mediabunny/new-video)
- [MDN — Web audio codecs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)
- [Mozilla Hacks — HTML5 audio sprites](https://hacks.mozilla.org/2012/04/html5-audio-and-audio-sprites-this-should-be-simple/)
- [WebAudio sidechain issue](https://github.com/WebAudio/web-audio-api/issues/246)
