# Techspec 017 — Transitions

## Problem

Onda ships 40+ components but **zero transitions**. Multi-scene compositions — the default shape of any product video, explainer, or reel — currently have to reach outside Onda for scene-to-scene movement. `VideoClip`'s docs already anticipate this gap (`fade: false` is documented as *"typical inside a `<TransitionSeries>` where the transition primitive handles fades"*), but no primitive ships.

Remotion provides `@remotion/transitions` with `fade`, `slide`, `wipe`, `flip`, `clockWipe`, `iris`, `cube`, `none`. These work, but their defaults — linear timing, generic easing — read as "generic Remotion transition," not "Onda transition." A studio composing with Onda today either:

1. Imports `fade()` from `@remotion/transitions` directly — works, but the moment loses the Onda fingerprint (calm easing, no overshoot, restrained timing). The scenes feel Onda; the *cuts between them* don't.
2. Builds custom presentations per project — duplicates work, drifts from the house feel.

This is the largest remaining gap blocking Onda from being a complete substrate for multi-scene composition. Cuts between scenes are as load-bearing for identity as the scenes themselves — arguably more, since the cut is what makes a sequence feel directed vs assembled.

## Decision

**Ship a `transitions` category under `registry/transitions/`.** Each transition is a factory that returns a `TransitionPresentation` compatible with Remotion's `<TransitionSeries>`. House easing and timing are baked into the defaults; consumers can override per-call but inherit the Onda feel for free.

Transitions are not React components — they're presentation factories. They get their own sub-contract that mirrors the component contract where it makes sense (Zod-first, single-folder layout, README with usage, registry entry) and diverges where the shape genuinely differs (factory export instead of default-export component, no `<Composition>` snippet in the README).

### Public API

```ts
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { crossFade, push, wipe } from 'ondajs/transitions';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={crossFade()}
    timing={linearTiming({ durationInFrames: 18 })}
  />
  <TransitionSeries.Sequence durationInFrames={150}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

Each factory accepts an options object validated by a Zod schema, returns a `TransitionPresentation<Props>`. The factory shape is:

```ts
export function crossFade(options?: CrossFadeOptions): TransitionPresentation<CrossFadeProps> {
  const opts = crossFadeSchema.parse(options ?? {});
  // ...
  return { component: CrossFadePresentation, props: { ... } };
}
```

### House defaults (inherited by every transition)

Sourced from existing lib modules — no new constants:

- **Easing:** `Easing.bezier(0.16, 1, 0.3, 1)` from [lib/easing.ts](../../lib/easing.ts) for opacity/color interpolation.
- **Spring:** `SPRING_SMOOTH` from [lib/motion.ts](../../lib/motion.ts) (`damping: 200, stiffness: 100, mass: 1`, no overshoot) for position/scale.
- **Duration:** `DURATION.base` (18 frames at 30fps) is the recommended default timing. Transitions don't own their duration — the caller passes it via `<TransitionSeries.Transition timing>` — but the README example for every transition uses 18 frames so the house cadence is the path of least resistance.

### File layout

```
registry/transitions/<transition-name>/
  <transitionName>.tsx       # factory + presentation component, camelCase file
  schema.ts                  # re-exports Zod schema
  <transition-name>.meta.json
  README.md
```

Mirrors `registry/components/<name>/` exactly except:
- The `.tsx` file's default export is the **factory function**, not a React component. The presentation component is an internal implementation detail (named export OK for testing, not part of the public surface).
- The README's usage snippet shows the factory inside a `<TransitionSeries>`, not inside a `<Composition>`.

### Registry shape

Add transitions to `registry/registry.json` using the existing `items` array, with `type: "registry:component"` (keeps the `bunx ondajs add cross-fade` install path working unchanged) and `categories: ["transitions"]` for filtering. Example:

```json
{
  "name": "cross-fade",
  "type": "registry:component",
  "title": "crossFade",
  "description": "A calm opacity cross-fade between two scenes. The Onda house defaults — 18-frame cubic bezier — read as deliberate, not generic.",
  "categories": ["transitions"],
  "dependencies": ["remotion", "@remotion/transitions", "zod"]
}
```

`lib/registry-summary.ts` will need a small update to surface transitions as a distinct group in `/r/lib-registry-summary.json`, so the docs site and Studio can list them cleanly.

## Catalog

Ten transitions. Every one carries the Onda fingerprint via the house defaults above. The split between Remotion-wrapped and Onda-original is documented per-entry so contributors know which arm of the codebase they're touching.

### Remotion-wrapped (6)

Thin presentations over `@remotion/transitions` primitives, with Onda easing/timing baked in.

| Name | Wraps | Options |
| --- | --- | --- |
| `crossFade` | `fade()` | none (just the house easing) |
| `slide` | `slide()` | `direction: 'left' \| 'right' \| 'up' \| 'down'` |
| `wipe` | `wipe()` | `direction: 'left' \| 'right' \| 'up' \| 'down'` |
| `clockWipe` | `clockWipe()` | none |
| `flip` | `flip()` | `direction: 'left' \| 'right' \| 'up' \| 'down'` |
| `iris` | `iris()` | `x?, y?` (default: center) |

### Onda-originals (4)

Not provided by Remotion. Hand-written presentations.

| Name | Description |
| --- | --- |
| `push` | Both scenes translate together as a unit (vs `slide` which only moves the incoming scene). Reads as a camera pan between scenes. Options: `direction`. |
| `dipToColor` | Outgoing scene fades to a solid color, incoming fades up from it. The editing-room classic (dip-to-black, dip-to-white). Options: `color` (defaults to `--onda-bg`). |
| `morph` | Cross-fade with a subtle synchronized scale (outgoing 1→1.04, incoming 0.96→1) so the cut feels cinematic, not flat. Pure Onda restraint — the scale is small enough to register as polish, not effect. |
| `depthPush` | Push with parallax depth scale — outgoing scene scales down slightly as it pushes off, incoming scales from slightly large. Onda's signature multi-scene move. Options: `direction`. |

### Explicitly excluded

- **`cube`**, **`none`** — `cube` is too gimmicky for Onda's restraint; `none` is a Remotion utility, not a presentation. Consumers who want either should import directly from `@remotion/transitions`.

## Goals

- Studios composing multi-scene videos with Onda never reach outside Onda for transitions.
- Every transition reads as deliberately Onda — house easing, no overshoot, restrained timing — with zero configuration.
- Adding a new transition is a one-file-folder change agents can pattern-match from `cross-fade` (the reference implementation).
- Transitions surface in the docs site and Studio as a first-class category, listed alongside components.

## Non-goals

- **No agent-pickable enum / dispatch layer.** A `kind: "cross-fade" | "push-left" | ...` mapping is a Studio concern — Studio builds it over Onda's named exports. The lib ships named factories; consumers import what they need.
- **No Remotion-parity wrapping.** We're not shipping `cube` or `none` just to "cover" Remotion. Each transition we ship must carry Onda character; consumers who need exotic Remotion transitions import them directly.
- **No transition-internal duration prop.** The duration is a Remotion `<TransitionSeries.Transition timing>` concern — passing it twice (once to the factory, once to the wrapper) would be redundant and let the two drift.

## Plan

1. **Reference implementation: `crossFade`.** Smallest possible transition; exercises the full contract (factory shape, schema, meta, README, registry entry). Lands first as the pattern other contributors copy.
2. **Update `lib/registry-summary.ts`** to surface transitions as a distinct group.
3. **Add `@remotion/transitions` to `package.json` deps.** Keep at the same `^4.0.0` range as the rest of the Remotion deps.
4. **Coordinate scope with Studio** *after* (1)-(3) land — share the catalog table above, confirm the factory shape matches what Studio's mapper needs, then parallelize the remaining 9 transitions one-per-branch per the existing workflow rules in CLAUDE.md §5.
5. **Build the catalog.** One transition per branch. Remotion-wrapped first (mechanical), then Onda-originals (require more design judgment).

## Open questions

1. **Should `dipToColor`'s default color be `--onda-bg` (canvas) or pure black?** Canvas reads more "stylistically Onda"; black reads more "editing convention." Leaning canvas — every other Onda default uses tokens.
2. **Naming consistency: `crossFade` vs `fade`?** Remotion's export is `fade`. We're going with `crossFade` because in a transition context "fade" is ambiguous (fade in? fade out? both?) and `crossFade` is unambiguous. Worth a sanity check before locking.
3. **Does Studio need any transition-shape that's not in the catalog?** The non-goal on agent enums stands, but if Studio has concrete user-facing transitions in mind that aren't covered (e.g. specific named "cinematic" presets), worth surfacing before we lock the catalog.
