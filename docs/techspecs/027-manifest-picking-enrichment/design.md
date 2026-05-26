# Techspec 027 — Manifest picking enrichment (`pickWhen` + `composes`)

> Tracks [#31](https://github.com/degueba/onda/issues/31). Builds on [techspec 018](../018-runtime-manifest-export/design.md). Originated from an integration ask: an agent runtime consuming `manifest` couldn't reliably *pick* between near-neighbors without prompt-side curation. Counter-proposal to a wider `pickingHints` shape — see *Reasonable calls*.

## Problem

The runtime `manifest` (018) gives consumers `{ name, category, title, description, schema }` for every component and transition. That is enough to **render** any picked component, but not enough for an LLM to reliably **pick** between near-neighbors at composition time.

Three concrete failure modes:

1. **Sibling differentiation in dense categories.** `entrances` has 15 entries. BlurReveal, FadeIn, ScaleIn, SlideIn, WordStagger, TrackingIn, MaskReveal, MatrixDecode, SlotMachineRoll, StaggerGroup… each description is accurate, but the differentiator (when to pick this *over the others*) is often the last clause of a paragraph — easy to lose to truncation, easy to miss when 60+ entries are concatenated into a system prompt. BlurReveal ends with *"The reference Onda primitive"*; FadeIn opens with *"A pure opacity fade … The simplest possible reveal."* The signal exists; the structure to surface it cheaply does not.

2. **Scene blocks reinvented.** TitleCard, StatCard, EndCard, LowerThird, LogoSting, QuoteCard, ChapterCard are scene blocks whose descriptions say *"Composes BlurReveal, WordStagger, and Underline"* (etc.). An agent reading the manifest as a flat list with no structured "composes from" data will happily reassemble StatCard from primitives every turn, missing the curated cascade and house timing the scene block already encodes.

3. **The summarizer is description-only.** [`summarizeRegistryAsMarkdown`](../../composing-agent-helpers.md) — the canonical system-prompt builder — derives everything from JSON Schema descriptions and prop tables. There is no slot for *"when to reach for this over its siblings"* and no slot for *"this is built from those."*

Track-placement / role concerns (atmosphere belongs on back tracks, scene blocks on focal tracks) are **not** part of this problem. They're a category-level convention (already documented in [`composing-with-onda.md`](../../composing-with-onda.md)), not a per-component datum.

## What this looks like

Concretely, a section of the agent's system prompt for the `entrances` and `scenes` categories reads like this after the change — same prose the manifest already exposes, plus one italic line that survives truncation:

```markdown
### blur-reveal

A calm, spring-driven text reveal: blur and opacity fade in together
while the text rises by 16px. No overshoot. The reference Onda primitive.

*pick when:* any text reveal where the brief doesn't ask for something
specific — this is the house default. Reach for a sibling only with intent.

| prop | type | required | default | notes |
| ---- | ---- | -------- | ------- | ----- |
| …    |  …   |          |         |       |

### fade-in

A pure opacity fade for text — no movement, no scale, no blur.
The simplest possible reveal.

*pick when:* layout shift is unacceptable — captions over video, text
inside a frame, anything where motion would jiggle neighboring content.

### word-stagger

Multi-word text where each word fades and rises in sequence — the
clearest demonstration of the Onda stagger fingerprint.

*pick when:* the line should read across like a sentence being spoken,
not land all at once. Pair with a held-still subject above or below.

### stat-card

Flagship Onda data scene — a big counted-up number above a
word-staggered label above an accent rule. Composes CountUp, WordStagger,
and Underline so the cascade (number → label → rule) reads as one calm motion.

*pick when:* the brief is "show one big number" — KPI, milestone,
headline figure, announcement frame. Don't reassemble from the parts.
*composes:* [count-up](#count-up) + [word-stagger](#word-stagger) + [underline](#underline)
```

The `*pick when:*` line lands in the first three lines of every section — agents that truncate per entry still see it. The `*composes:*` cross-links say *"the scene block exists, prefer it over the parts"* without needing prose. Voice is the same as the catalog: short, specific, no hedging.

## Decision

Add two optional fields — and only two — to `ComponentManifestEntry` and to each component's `<slug>.meta.json`:

```ts
export type ComponentManifestEntry = {
  // … existing fields from techspec 018 …
  /** One sentence — when to pick this over its near-neighbors. Written
   *  for an LLM choosing between siblings in the same category. Authored
   *  alongside `description` in <slug>.meta.json; kept under ~140 chars
   *  so it survives prompt truncation. */
  pickWhen?: string;
  /** Component slugs this entry delegates motion to. Populated only for
   *  scene blocks and other composing components — leave undefined for
   *  primitives. Already implied today by descriptions ("Composes
   *  CountUp, WordStagger, and Underline"); this just makes it queryable. */
  composes?: string[];
};
```

Authored once per component in `<slug>.meta.json`. The manifest generator already reads meta.json (018) — these fields pass through unchanged. Both are **optional**: primitives and atmospheric layers typically have no `composes`, and entries whose `description` is already a clear differentiator can ship without `pickWhen` in v1.

`summarizeRegistryAsMarkdown` is extended to surface both when present:

- `pickWhen` renders as a `*pick when:* …` italic line directly below the description, before the prop table — high salience without expanding the table schema.
- `composes` renders as `*composes:* [CountUp](#count-up), [WordStagger](#word-stagger), [Underline](#underline)` so an agent reading the prompt sees *"prefer StatCard over reassembling from these"* implicitly via the link-back structure.

The two existing summarizer entry points — `summarizeRegistry` (structured) and `summarizeRegistryAsMarkdown` (string) — keep their current signatures. New fields are additive on the return shape.

## Goals

- One sentence per component, authored by the lib maintainer, lets every downstream agent runtime pick between near-neighbors without each runtime curating its own role map.
- `composes` makes the prefer-the-scene-block hint structurally queryable — agents that filter `manifest.filter(e => e.composes?.length)` get the catalog's curated assemblies.
- New fields are **optional** — no existing component meta needs to change to keep working. Backfill incrementally, category-by-category, starting with `entrances` (densest) and `scenes` (where `composes` carries the most weight).
- Authored once at the source (`<slug>.meta.json`), surfaced everywhere downstream — no parallel role map in Studio or any other consumer.

## Non-goals

- Not adding a `role` enum. Values like `"scene-block"` and `"atmospheric-layer"` would duplicate `category === 'scenes'` and `category === 'atmosphere'`. Two parallel taxonomies drift; we already have one (`category`).
- Not adding an `alternatives: string[]` field. Semantics are ambiguous (similar effect? similar prop shape? interchangeable?), maintenance is high (every new component invalidates neighbors' lists), and the agent can already enumerate neighbors via `manifest.filter(e => e.category === current.category)`.
- Not adding a `default: true` flag for "the reference component" per category. The author has been deliberate about *not* anointing a single default — BlurReveal is "the reference primitive" but FadeIn, WordStagger, TrackingIn each have legitimate first-reach contexts. `pickWhen` captures that nuance; a boolean flag flattens it.
- Not adding track-placement hints (`layer: 'atmosphere' | 'subject' | 'overlay'`). Track placement is a category-level convention, documented in `composing-with-onda.md`. Per-component repetition would invite drift.
- Not changing the existing `<slug>.meta.json` shape beyond two additive optional fields. No migration, no version bump on the meta format.
- Not authoring all 60+ `pickWhen` strings in this spec's PR. The shape lands first; backfill is sequenced separately.

## Reasonable calls (challenge any)

- **Two fields, not a `pickingHints` object.** The original ask proposed a nested `{ whenToUse, role, alternatives }`. Flat top-level optional fields match the existing manifest shape (everything else is flat — `name`, `category`, `description`, `schema`), keep the type definition scannable, and avoid carrying the rejected `role` / `alternatives` slots in the shape "for future use."

- **`pickWhen`, not `whenToUse` / `agentHint` / `pickingHint`.** Two-word camelCase verb-phrase reads in context — `entry.pickWhen` is grammatical at the call site. `whenToUse` is fine but slightly longer; `agentHint` bakes the consumer (agent) into the field name when the data is useful to any picker; `pickingHint` is awkward.

- **`composes`, not `composesOf` / `delegatesTo` / `parts`.** Mirrors the prose convention ("Composes X, Y, Z") already in the descriptions. Reads as a verb in the type — `entry.composes` returns the slugs.

- **Length cap on `pickWhen` is a convention, not a runtime check.** ~140 chars in the meta.json review checklist; no `z.string().max(140)` in the schema. The cap protects against prompt-truncation regressions; enforcing it via Zod would block legitimate edge cases (composing components might need slightly more) and add a failure mode where a meta change crashes the manifest build.

- **Backfill in `entrances` and `scenes` first.** Densest category and the one where `composes` carries the most agent value. Other categories (atmosphere, cinematic) have fewer entries and clearer differentiators in their existing descriptions — backfill is cheap when their turn comes.

- **Don't touch transitions in v1.** 15 transitions, much smaller picking surface, and the directional vocabulary (`left`/`right`/`up`/`down`) already differentiates near-neighbors structurally. Revisit if the same picking pain shows up on transition selection.

- **Summarizer surfaces `composes` as cross-links, not a plain list.** A link-back like `*composes:* [CountUp](#count-up) + [WordStagger](#word-stagger) + [Underline](#underline)` makes the dependency relationship visible in markdown form, so even when the prompt is read linearly the agent sees the scene block sitting *above* the primitives in the catalog ordering.

## Open questions

- **Should `composes` be enforced as valid slugs at build time?** Lean yes — the manifest generator already has every slug in scope. A `composes` value pointing to a missing slug should fail the generator (same as a missing schema would). Cheap, prevents silent rot.

- **Does `pickWhen` belong in `<slug>.meta.json` or in `schema.ts` as a `.describe()` decorator on the top-level schema?** Lean meta.json — `pickWhen` is metadata about the component as a *catalog entry*, not about the props themselves. Keeping it in meta.json also leaves the schema bundle (41 KB minified post-018) untouched.

- **Backfill ordering inside `entrances`?** Suggested: BlurReveal first (it's the "reference primitive" — anchors the others' `pickWhen` by contrast), then the differentiable ones (FadeIn = no movement, Typewriter = linear pacing, MatrixDecode = decode reveal, SlotMachineRoll = numeric reel, MaskReveal = retreating clip-path, TrackingIn = letter-spacing contraction), then the spring-and-fade family (ScaleIn, SlideIn, RotateIn, WordStagger, StaggerGroup) where the differentiator is subtler.

## Implementation

Three small, sequenceable changes:

1. **Type + meta.json shape (one PR).** Extend `ComponentManifestEntry` in [`packages/cli/src/manifest.ts`](../../../packages/cli/src/manifest.ts) with the two optional fields. Extend the meta.json validator (wherever it lives in the sync-manifest pipeline) to accept and pass through `pickWhen` and `composes`. Add the build-time check that every slug in `composes` resolves to a real manifest entry. **No data changes yet** — this PR ships the field plumbing only, so the next PRs are pure content.

2. **Summarizer surfacing (one PR).** Update [`lib/registry-summary.ts`](../../../lib/registry-summary.ts) to read `pickWhen` and `composes` from the matched manifest entry (lookup by slug) and render them in `summarizeRegistryAsMarkdown` per the *Decision* layout. `summarizeRegistry`'s structured return adds `pickWhen?: string` and `composes?: string[]` on each `RegistryComponentSummary`. Existing callers continue to work — new fields are additive.

3. **Backfill (rolling PRs).** Author `pickWhen` per component, starting with `entrances` (15 entries) and `scenes` (7 entries). Each PR can carry multiple components — the work is editorial, not structural. `composes` is backfilled on the same PRs for scene blocks and any composing component. Atmospheric / cinematic / data / graphics / interface / media categories follow at whatever cadence the lib author chooses; nothing blocks anything.

Total scope: ~50 lines of code (steps 1 and 2 combined) plus ongoing editorial work on meta.json files. No new dependencies, no schema bundle impact, no breaking changes to the 018 contract.

## Appendix — drafted voice for the `entrances` category

Reference draft for step 3's editorial backfill. Adopt as-is, refine, or replace — the point is to fix the *voice* now so the backfill PR isn't bikeshedding tone per component. Short, specific, no hedging, ~140 chars.

| slug | `pickWhen` |
| --- | --- |
| `blur-reveal` | any text reveal where the brief doesn't ask for something specific — the house default. Reach for a sibling only with intent. |
| `fade-in` | layout shift is unacceptable — captions over video, text inside a frame, anything where motion would jiggle neighbors. |
| `fade-out` | the moment ends and you want it to end cleanly. Pair with whichever entrance opened the beat. |
| `word-stagger` | the line should read across like a sentence being spoken, not land all at once. The clearest stagger fingerprint. |
| `stagger-group` | revealing a list of arbitrary children, not a sentence. Bullets, feature rows, badges — anything with siblings. |
| `tracking-in` | a cinematic title beat where the type itself is the moment. Don't combine with another entrance on the same line. |
| `scale-in` | small UI affordances — icons, badges, chips. Restraint on the scale is the point; not for headlines. |
| `slide-in` | the line *should* arrive from a direction (off-frame label, broadcast lower-third). Pass `direction` deliberately. |
| `slide-out` | the line should exit toward a direction. The mirror of SlideIn. Not for general "this beat is done." |
| `rotate-in` | a single accent moment — a quote attribution, an Easter egg. Stay inside [-12, +12] degrees. |
| `mask-reveal` | the text needs to land with a hard edge, not a soft fade. Editorial / brutalist beats. |
| `typewriter` | the brief reads as typed — terminal output, AI response, code snippet. Linear pacing is the point. |
| `matrix-decode` | a one-shot reveal where the text *decoding* is the moment. Short strings only — long lines drown the effect. |
| `slot-machine-roll` | a numeric reveal with weight — final score, jackpot, release number. Short numerics only. |
| `word-rotate` | a held-in-place rotation across a phrase list — taglines, value props, "X for Y" cycles. |

## Appendix — `composes` map for the `scenes` category

Already implied by current descriptions; this is the structured form the spec ships.

| slug | `composes` |
| --- | --- |
| `chapter-card` | `['fade-in', 'blur-reveal', 'underline']` |
| `end-card` | `['blur-reveal', 'underline', 'stagger-group']` |
| `logo-sting` | `['draw-on', 'scale-in', 'underline']` |
| `lower-third` | `['slide-in', 'fade-in', 'underline']` |
| `quote-card` | `['word-stagger', 'underline']` |
| `stat-card` | `['count-up', 'word-stagger', 'underline']` |
| `title-card` | `['blur-reveal', 'word-stagger', 'underline']` |
