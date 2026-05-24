# Roadmap — Techspec 010

Execution plan for [design.md](design.md). Update statuses as work lands.

## M1 — Ship `ImageReveal` — Done

Shipped at `registry/components/image-reveal/` with the spec'd schema, three `motion` variants (`'blur'` inlines BlurReveal's math; `'fade'` composes `entryFade`; `'scale'` composes `entryScale` with `from: 0.95`). Default behavior fills the canvas (mirrors `KenBurns` / `Parallax`); `placement` switches to sub-canvas positioning via `PlacementBox`. Registry manifest generated; `registry.json` synced. Typecheck clean.

New component at `registry/components/image-reveal/`. Pattern-matches the existing component contract (CLAUDE.md §4).

**File layout:**

```
registry/components/image-reveal/
  ImageReveal.tsx          # component + Zod schema
  schema.ts                # re-export per catalog convention
  image-reveal.meta.json   # registry metadata (category: "media")
  README.md                # prop table + usage snippet
```

**Acceptance:**

- Schema declares all props from design.md §Decision (§1 `ImageReveal`).
- Three `motion` variants render: `'blur'` (opacity + blur falloff), `'fade'` (opacity only), `'scale'` (opacity + scale 0.95→1, no overshoot).
- Wraps Remotion's `<Img>` inside a `<PlacementBox placement={placement}>`. Image fits via `objectFit: fit`; respects `width` / `height` when set, otherwise fills `PlacementBox` inner.
- `borderRadius` applies to the image element.
- All three motion variants use `SPRING_SMOOTH` for progress. Inline math only where `entryFade` / `entryScale` don't fit (the blur variant).
- Composes `entryFade` from `lib/choreography.ts` for the `'fade'` variant; `entryScale` for the `'scale'` variant.
- README includes a usage snippet with a Composition showing `<ImageReveal src=".../sample.jpg" />` rendered at 1080×1920.
- Meta JSON: `category: "media"`, tags include `"image"`, `"reveal"`, `"media"`.
- `registry.json` index updated via `pnpm sync-registry`.
- `registry/r/image-reveal.json` generated via the existing one-shot regen pattern.
- `pnpm typecheck` passes.

## M2 — Ship `VideoClip` — Done

Shipped at `registry/components/video-clip/` with all spec'd props. Wraps `<OffthreadVideo>`; `startAt` / `endAt` resolve via `toFrames()` (accepts `"0:04"` / `"30s"` / raw seconds / `"90f"`); `loop` wraps in Remotion's `<Loop>` (with fade-out auto-disabled since looping has no defined end); `fade` envelope handled inline via `interpolate`. Registry manifest generated; `registry.json` synced. Typecheck clean.

New component at `registry/components/video-clip/`. Same shape as M1.

**Acceptance:**

- Schema declares all props from design.md §Decision (§2 `VideoClip`).
- Wraps Remotion's `<OffthreadVideo>` inside a `<PlacementBox placement={placement}>`.
- `startAt` / `endAt` resolved via `toFrames(value, fps)` from `lib/timing.ts` and passed to `<OffthreadVideo startFrom={...} endAt={...}>`.
- `loop: true` wraps the `<OffthreadVideo>` in Remotion's `<Loop>`.
- `fade: true` applies an opacity envelope: fade-in over `fadeDuration` at clip start, fade-out over `fadeDuration` at clip end (computed against the rendered clip length, not the source video length).
- `muted` / `volume` passed through to `<OffthreadVideo>` directly.
- `fit` resolves to `objectFit` on the video element.
- README includes a usage snippet showing `<VideoClip src=".../sample.mp4" startAt="0:02" endAt="0:08" />`.
- Meta JSON: `category: "media"`, tags include `"video"`, `"clip"`, `"media"`.
- Both new components registered in `registry.json` + manifests generated.
- `pnpm typecheck` passes.

## M3 — Update `docs/composing-with-onda.md` to cover media — Done

Added a "Media" subsection under the component index covering `ImageReveal` and `VideoClip` (full prop summaries with placement / size notes), plus a brief callout for `KenBurns` / `Parallax` as the pre-existing specialized image-with-motion alternatives. Added a "Media composition pattern" worked example showing background photo (`KenBurns`) + sequential foreground beats (`ImageReveal` + `VideoClip`) inside a `<Series>`.

Append a "Media composition" section near the typography sections; surface the two new components in the component index.

**Acceptance:**

- New section explains the media-passthrough model (lib doesn't host; caller passes `src` URLs from their asset store).
- Worked example: a timeline payload with one image entry + one video entry on a single track.
- Component index gains entries for `ImageReveal` and `VideoClip` under a new "Media" category.
- Brief mention of `KenBurns` / `Parallax` as specialized image-with-motion alternatives (they pre-date 010, no migration).

## M4 — Verify with a real composition — Deferred (visual check)

Requires running the Remotion studio (`pnpm dev`) and visually scrubbing through compositions that exercise both new components together. Code-level acceptance (typecheck, schema validation, manifest generation) all clean; the visual smoke test is the remaining gate before the next catalog release.



Build a small test composition that exercises both components together — `ImageReveal` for a static photo, `VideoClip` with trim and fade for a clip — proves the integration end-to-end before declaring 010 done.

**Acceptance:**

- A test composition (e.g., `registry/dev-compositions/media-test.tsx` or `pnpm dev`'s Remotion studio entry) renders `ImageReveal` and `VideoClip` together, sequenced via `<Series>` from a single `<AbsoluteFill>`.
- Visual check: image enters with the chosen `motion` variant; video trim respects `startAt` / `endAt`; fade-in / fade-out visible at clip boundaries; both respect `placement`.
- No console errors, no Remotion warnings about media loading.

## Out of scope (later techspecs)

- **011 — Audio primitives.** `AudioVisualizer` and audio-reactive visuals. Separate techspec when ready to design the variant catalog and amplitude-sampling cadence.
- **012 — Media composites.** `MediaCard` (image/video + caption layout), `PhotoStack`, `BeforeAfter`. Only if usage patterns demand them.
- **Generative media (txt2img, txt2vid).** Product surface, not lib primitives.
- **Caption / overlay-text built into `ImageReveal`.** Defer until the composite-card decision settles.
- **`playbackRate` on `VideoClip`.** Defer until concrete demand.
- **A `'pan'` motion variant on `ImageReveal`.** Possibly its own primitive (`ImagePan`) if real use emerges.
- **Asset URL lifecycle (signed URLs, expiry, fallback placeholders).** Caller's concern.
