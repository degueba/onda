# Roadmap — Techspec 011

Execution plan for [design.md](design.md). Update statuses as work lands.

## M1 — Ship `AudioClip`

New component at `registry/components/audio-clip/`. Pattern-matches the component contract (CLAUDE.md §4).

**File layout:**

```
registry/components/audio-clip/
  AudioClip.tsx           # component + Zod schema
  schema.ts               # re-export
  audio-clip.meta.json    # registry metadata (category: "audio")
  README.md               # prop table + usage + bed/VO/SFX patterns
```

**Acceptance:**

- Schema declares all props from design.md §Decision (§1 `AudioClip`).
- Wraps Remotion's `<Html5Audio>` (current official recommendation per Remotion docs).
- `startAt` / `endAt` resolved via `toFrames(value, fps)` and passed to `<Html5Audio trimBefore={...} trimAfter={...}>` (the modern prop names; the old `startFrom` / `endAt` are deprecated).
- `volume` always passed as a callback (`volume={(clipFrame) => …}`) so:
  - The fade envelope (fade-in over `fadeDuration` at clip start; fade-out at end when `endAt` is set and not looping)
  - The `gainDb → amplitude` conversion (`10 ** (gainDb / 20)`) when set
  - The base `volume` multiplier
  ... all compose in one place. Remotion can then draw the curve in Studio.
- `acceptableTimeShiftInSeconds` passed through with default `0.1` (vs Remotion's 0.45).
- `loop: true` wraps in Remotion's `<Loop>`; fade-out auto-disabled when looping.
- README documents the bed / VO / SFX patterns from design.md §Composition patterns.
- Meta JSON: `category: "audio"`, tags include `"audio"`, `"clip"`, `"playback"`.
- Both new components registered in `registry.json` via `pnpm sync-registry`.
- `registry/r/audio-clip.json` generated.
- `pnpm typecheck` passes.

## M2 — Ship `AudioVisualizer`

New component at `registry/components/audio-visualizer/`. Same shape as M1.

**Acceptance:**

- Schema declares all props from design.md §Decision (§2 `AudioVisualizer`).
- Component calls `useAudioData(src)` internally (cached per src by Remotion).
- `'bars'` variant uses `visualizeAudio({ frame, fps, audioData, numberOfSamples, smoothing, optimizeFor })` from `@remotion/media-utils`; renders SVG `<rect>` elements positioned via `<PlacementBox placement={placement}>`.
- `'waveform'` variant uses `visualizeAudioWaveform()` (time-domain); renders an SVG `<polyline>`.
- `numberOfSamples` Zod-refined to power-of-two; default `32`.
- `smoothing: true` default; `optimizeFor: 'accuracy'` default.
- Component **does not play audio** — pure visualization. README spells this out and shows the paired `AudioClip + AudioVisualizer` pattern.
- Add `@remotion/media-utils` to the meta's `dependencies` so the CLI surfaces it as a peer dep.
- Meta JSON: `category: "audio"`, tags include `"audio"`, `"visualization"`, `"waveform"`, `"bars"`.
- Registry manifest generated; `registry.json` synced.
- `pnpm typecheck` passes.

## M3 — Update `docs/composing-with-onda.md` with audio section

Append an "Audio" component-index subsection covering both new primitives, plus a "Sound design conventions" section covering the performance rules + bed/VO/SFX patterns from design.md.

**Acceptance:**

- New "Audio" subsection in the component index with prop summaries for `AudioClip` and `AudioVisualizer` (same shape as the Media subsection from 010).
- New top-level "Sound design conventions" section covering:
  - Format hints (WAV for transients, AAC for everything else, avoid MP3).
  - dB ↔ amplitude conversion formula + standard duck cuts (-6 dB SFX, -12 dB VO).
  - The bed / VO / SFX / visualizer patterns from design.md §Composition patterns.
  - The performance rules from design.md §Performance rules (audio rendering, audio visualization).
- "Picking the right audio component" decision matrix (same shape as the Media decision matrix in 010): bed → AudioClip with loop+fade; VO → AudioClip in Sequence; SFX → AudioClip with short trim; visualize → AudioVisualizer + parallel AudioClip.
- Cross-reference to `composition-renderer` since AudioClip uses the same `at`/`for` placement pattern as visual entries.

## M4 — Verify with a real composition

Build a small test composition exercising both `AudioClip` (bed + VO + SFX patterns) and `AudioVisualizer` together. Required before declaring 011 done.

**Acceptance:**

- Test composition: bed `AudioClip` with `loop: true`, fade-in over 60 frames, ducked via volume callback when a VO `AudioClip` is active. SFX `AudioClip` instances trigger at known beats via `<Sequence from={...}>`. Parallel `AudioVisualizer` showing bars at the bottom of the canvas tied to the bed's `src`.
- Scrubbing in `pnpm dev` confirms:
  - Audio plays at the correct composition frame.
  - Trim (`startAt` / `endAt`) clips the source correctly.
  - Fade-in / fade-out audible at clip boundaries.
  - Ducking heard when VO active.
  - Visualizer bars animate in sync with the bed audio.
  - No console errors, no Remotion warnings.
- Empirical confirmation of audio mixing semantics (multiple overlapping `<Html5Audio>` sum cleanly) — flag any unexpected behavior in this roadmap or open a follow-up.

## Out of scope (later techspecs)

- **`AudioVisualizerWindowed`** for >5min audio via `useWindowedAudioData`. Document the path in 011 but don't build until demand.
- **`@remotion/media`'s `<Audio>` as the backend.** Internal refactor when it leaves experimental; no API change.
- **`playbackRate` as a callback** for time-varying speed.
- **`AudioVisualizer.variant: 'pulse'`** — single-bar amplitude. Add if a real composition demands it.
- **Stereo / multi-channel visualization.** v1 sums to mono.
- **Pre-decode helpers** (`useDecodedAudio([srcs])`). Add when SFX-heavy compositions hit first-playback stalls in practice.
- **Real-time sidechain ducking.** Volume-callback envelopes are the documented pattern; no primitive needed.
- **Audio editing UI.** Caller's concern.
