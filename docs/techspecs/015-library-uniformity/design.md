# Techspec 015 — Library uniformity (placement everywhere)

## Problem

After 008 (canvas-aware components: `placement` + `size`), `placement` was added to a subset of the catalog. Three years of incidental retrofitting left an inconsistent surface:

- `BlurReveal` accepts `placement`, but `Typewriter` does not.
- `TitleCard` accepts `placement`, but `LogoSting` does not.
- `WordStagger` accepts `placement`, but `WordRotate` does not.

There's no design reason for any of these gaps — components that shipped before 008 simply weren't back-filled when 008 landed. The cost is concrete: every consumer (developer or agent) writing a multi-component scene has to wrap half the catalog in `<AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>` boilerplate that the placement system was supposed to eliminate.

The catalog reel hero ([www/src/components/HeroComposition.tsx](../../../www/src/components/HeroComposition.tsx)) exposed this concretely: a data-driven loop over 11 components hit the gap immediately and had to ship a flex-centering wrapper in `BeatTransition` as a workaround — exactly the boilerplate placement was supposed to eliminate.

## Principle

**Every renderable component supports the same vocabulary.** If a component draws something visible on the canvas, it accepts `placement`. No "this primitive is special." No per-component support matrix to memorize.

The only exempt category is **pure layer effects** — components that *are* the canvas, not *on* it. `Vignette`, `GrainOverlay`, `GradientShift` describe an effect over the whole frame and have no meaningful concept of "where on the canvas." Everything else gets placement.

## Audit

Authoritative as of this spec. Generated from `grep -c "placement" registry/components/*/*.tsx`.

### Already supports `placement` (12 — no work)

`BlurReveal`, `WordStagger`, `CountUp`, `Highlight`, `TitleCard`, `QuoteCard`, `StatCard`, `LowerThird`, `ChapterCard`, `EndCard`, `ImageReveal`, `VideoClip` *(plus `AudioVisualizer` shipping in [#15](https://github.com/degueba/onda/pull/15))*.

### Needs `placement` added (22)

| Component | Category | Notes |
| --- | --- | --- |
| `Typewriter` | text primitive | Same pattern as `BlurReveal`. |
| `Underline` | text primitive | Same. |
| `WordRotate` | text primitive | Same. |
| `FadeIn` | motion wrapper / text | Same. Renders `text` directly. |
| `FadeOut` | motion wrapper / text | Same. |
| `SlideIn` | motion wrapper / text | Same. |
| `SlideOut` | motion wrapper / text | Same. |
| `RotateIn` | motion wrapper / text | Same. |
| `ScaleIn` | motion wrapper / text | Same. |
| `MaskReveal` | motion wrapper / text | Same. |
| `StaggerGroup` | layout | Place the whole group. |
| `Captions` | text primitive | Place the caption block. |
| `DrawOn` | SVG primitive | Place the SVG container. |
| `BarChart` | data primitive | Same pattern. |
| `PieReveal` | data primitive | Same. |
| `ProgressBar` | data primitive | Same. |
| `Timeline` | data primitive | Same. |
| `IconPop` | graphics primitive | Same. |
| `LogoSting` | scene block | Same pattern as `TitleCard`. |
| `KenBurns` | cinematic | Wrap the inner motion in `<PlacementBox>` when placement set; canvas-fill when omitted. |
| `Parallax` | cinematic | Same. |
| `Marquee` | cinematic | Same. |
| `CameraShake` | wrapper | Apply placement to outer container; shake the child within. |

### Exempt (3 — pure layer effects)

`Vignette`, `GrainOverlay`, `GradientShift`. These describe an effect over the whole frame; placement has no meaning. Document the exemption in `composing-with-onda.md`.

### Special — preserve existing system (2)

`Callout` and `Spotlight` use their own `x` / `y` (0..1 canvas fractions) instead of `placement`. Functionally placed, just via a different vocabulary. Migrating them to `placement` is a breaking change (different prop names) and out of scope for 015 — file as a future spec if uniformity becomes load-bearing.

## Pattern

Mechanical, one-file edit per component. Identical shape to how `BlurReveal` does it today.

**Schema:**
```ts
import { placementSchema } from '../../../lib/canvas';

export const fooSchema = z.object({
  // ...existing props
  /** Where on the canvas this sits. Region (`'center'`, `'upper-third'`, ...) or `{ x, y, anchor }` in 0..1 canvas fractions. Coordinates may be negative or >1 for off-canvas. */
  placement: placementSchema.optional(),
});
```

**Component:**
```tsx
import { PlacementBox } from '../../../lib/canvas';

export const Foo: React.FC<FooProps> = ({ /* ...existing */, placement }) => {
  // ...existing motion / state
  return (
    <PlacementBox placement={placement}>
      {/* existing rendered output */}
    </PlacementBox>
  );
};
```

That's it. `PlacementBox` already handles the no-placement-passed case (renders an `AbsoluteFill` with sensible default positioning). Behavior with `placement` omitted is preserved for every component.

For cinematic primitives (`KenBurns`, `Parallax`, `Marquee`) that currently use `<AbsoluteFill>` to cover the canvas: switch the outer wrapper to `<PlacementBox placement={placement}>` — `PlacementBox` defaults to full-canvas when placement is undefined, so the default-omitted case still fills.

## Goals

1. Every renderable component accepts `placement` (22 added; 12 unchanged; 3 exempt).
2. `placement: undefined` preserves current behavior for every component — zero breaking change.
3. `docs/composing-with-onda.md` simplified: the per-component "placement: yes/no" callouts are removed because the answer is always yes (for renderable components, with a single noted exemption block).
4. Each component's README gets a `placement` row in its prop table.
5. The hero composition's flex-centering workaround in `BeatTransition` is removed — every beat self-places via `placement: 'center'`.
6. A general manifest-regen script replaces the per-component hand-built CLI manifests, since the changes touch ~22 manifests at once and per-file maintenance doesn't scale.

## Non-goals

- **Per-slot typography on composers.** Adding `titleFontWeight` / `subtitleFontWeight` etc. to `TitleCard` / `StatCard` etc. is a separate question (composer-level typography aggregation, deferred to a future spec — possibly the resumed 007 theming).
- **Migrating `Callout` / `Spotlight` to `placement`.** Different vocabulary, breaking change. File as a future spec if needed.
- **Adding the 014 typography prop set** (`fontWeight`, `letterSpacing`, `lineHeight`, `align`) **to composers.** Same composer-typography question; out of scope here. The 014 props remain on the 15 primitives that got them.
- **Reworking the `placement` vocabulary itself.** 008's vocabulary (region union + `{x,y,anchor}`) stays as-is.
- **Adding `placement` to `AudioClip`.** Audio has no visible output; the exemption is natural and uncontroversial.

## Reasonable calls (challenge any)

- **Default-omitted behavior preserved per component.** `PlacementBox` renders a flex-centered `AbsoluteFill` when placement is undefined, which works for components that want to be centered by default. Cinematic primitives (`KenBurns`, `Parallax`, `Marquee`) currently AbsoluteFill the canvas — `PlacementBox` covers that case too. No behavior change.
- **One PR, one sweep.** Bundling all ~22 retrofits + the hero cleanup + the docs simplification keeps the "library is uniform" narrative coherent. The alternative (one component per PR) would take 22 reviews to land the same outcome.
- **`Callout` / `Spotlight` left untouched.** Migrating them means renaming props (`x`, `y` → `placement: {x, y}`) which breaks every existing call site. Not worth the churn until placement-vocabulary unification has concrete consumer demand.
- **CLI manifest regeneration via script.** The per-slug `registry/r/<slug>.json` files include each `.tsx` as an escaped-string `content` field. Touching 22 components means regenerating 22 manifests; a hand-maintained map at that scale rots quickly. Ship a `scripts/regen-manifests.mjs` (extension of the audio-manifest script from #15) that walks all components and rebuilds. Run via `pnpm sync-manifests`.

## Open questions deferred

- **Composer-level typography aggregation** — see Non-goals. Future spec.
- **`Callout` / `Spotlight` migration to unified `placement`** — see Non-goals. Future spec if needed.
- **`<PlacementBox>` accepting children that need a max-width clamp** (e.g., text components in a small placement region). Today `PlacementBox` doesn't constrain inner width; long text may overflow a small region. Document in the placement section of `composing-with-onda.md` so callers know to set `maxWidth` themselves; address in a follow-up if it becomes a real pain.
