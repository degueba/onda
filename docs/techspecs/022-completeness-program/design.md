# Techspec 022 — Completeness program

> Umbrella initiative. Defines three workstreams that close Onda's remaining capability gaps as a complete, agent-native Remotion library. Each workstream lands as its own implementation spec (023–025) when picked up; this doc owns the framing, scope boundaries, and sequencing.

## Problem

Onda today is strong on **identity-bearing motion**: 42 components across entrances, scene blocks, data, graphics, cinematic, media, and atmosphere; 12 transitions (017) that carry the house feel across cuts; and an agent-helper layer (013) that exports the contract as JSON Schema, canvas presets, and a registry summary. The motion fingerprint — calm, restrained, no overshoot — is real and uncontested.

Three gaps keep Onda from being the *default* reach for the people most likely to use a Remotion library and to drive it from an AI agent:

1. **No developer-surface components.** A whole class of demo video — code walkthroughs, terminal sessions, browser/device framing, UI callouts — has no Onda primitives. Anyone making a changelog, launch, or product-demo video leaves Onda for these and never comes back for the rest.
2. **No full template compositions.** Onda ships *scene blocks* (title-card, stat-card, end-card) but no *assembled, multi-scene videos*. An agent asked for "a changelog video" has to compose from parts every time instead of starting from an opinionated whole. (Flagged as a follow-up in 013's open questions.)
3. **No published agent-discovery surface.** The infrastructure exists — `compositionJsonSchema`, `summarizeRegistryAsMarkdown`, the runtime manifest (018) — but nothing *publishes* it. There is no `llms.txt`, no machine-readable index served by the site, and no installable agent skill. The library's own thesis is "agents compose videos with it," yet an agent landing on the site or repo has no canonical entry point.

None of these are about volume for its own sake. Each is a missing *capability surface* that forces a consumer (or their agent) to step outside Onda — and every step outside is a step away from the motion identity that is the whole point.

## Decision

Run three independent workstreams under this umbrella. Each obeys the existing component/transition contract, the hard rules (§1), motion essentials (§3), and the design tokens (§2). Each lands as its own implementation spec and ships incrementally — there is no big-bang merge.

- **Workstream A — Dev-surface components** (spec 023). A new `interface` category of premium, restrained UI-surface primitives. The largest net-new lane.
- **Workstream B — Template compositions** (spec 024). ~~Assembled multi-scene videos under a `templates` sub-contract.~~ **Dropped — see the dated update at the foot of this doc.** The demonstration role it was meant to serve is met by the showcase corpus (`www/src/showcase/`), which is demonstration-only and not installable.
- **Workstream C — Agent-native discovery** (spec 025). Publish the already-built helpers as static, canonical artifacts: `llms.txt`, a machine-readable registry route, and an installable authoring skill.
- **Workstream D — Foundational primitives, helpers & hooks** (spec 026). A continuously-fed workstream: any low-level capability a scene, component, or template needs but Onda lacks gets shipped as a reusable primitive/helper/hook, never worked around inline.

Brand filter applies to all four — but the gate is **craft and intent, not energy**. Onda's *defaults and signature* stay calm and coherent (§2, §3); the *catalog* spans the full range, from restrained to high-energy, because real video production needs it. A punchy effect built to Onda's quality bar belongs; a cheap or sloppy one — at any energy level — doesn't.

-----

## Operating principle: prior-art lookup & capability-floor parity

Two rules that apply across every workstream and to every contributor (human or agent) executing this program:

1. **When in doubt, look up the prior art directly.** If you're unsure whether a capability should exist, what a complete catalog looks like, or how a primitive is typically shaped, check the reference implementations across the Remotion ecosystem before guessing. Treat them as a **completeness checklist, not a style guide**: match the *capability* so an Onda user is never sent elsewhere, but never the aesthetic — the look stays Onda (§2, §3).

2. **Capability-floor parity.** Anything a peer enables on their end, Onda makes possible on ours. If building a scene, component, or template surfaces a missing primitive, helper, or hook, **ship it** (brand-filtered) rather than route around it with a one-off or a non-deterministic hack. Helpers and hooks land in `lib/`; user-facing primitives land in the registry. This is the engine behind Workstream D — gaps discovered anywhere feed it.

**First audit: transitions.** 017 shipped 12 transitions. Before treating the catalog as closed, diff it against the ecosystem and add what's missing — across the full range. That includes the high-energy register (chromatic-aberration, RGB-split, glass/frosted wipe, grid pixelate) where the effect earns its place, not just the calm wipes. Editors reach for punch as well as polish; both belong, as long as they're built to Onda's quality bar.

-----

## Workstream A — Dev-surface components (→ spec 023)

A new `interface` category. Every entry is a self-contained component obeying the full contract (default export, Zod schema, premium token-based defaults, README, registry entry) and the library-uniformity vocabulary — `placement`, `size`, `fontFamily` — like every other renderable component. None of these exist in any Remotion-native form, so there is no built-in to prefer (checked per the Remotion-built-ins-first rule).

### Catalog (proposed)

| Name | What it is | Onda angle |
| --- | --- | --- |
| `code-block` | Syntax-highlighted code with line- or token-level reveal | Glass surface (§2 polish), Shiki tokens computed *outside* render (determinism, §1), calm staggered reveal — not a typewriter gimmick |
| `terminal` | Typed-command terminal session | Steady cursor, restrained prompt color (`--onda-faint`), command→output cadence via `<Sequence>` |
| `browser-frame` | Chrome frame wrapping a screenshot/content layer | Minimal chrome, token borders/radius; a *container* others nest into |
| `device-frame` | Phone / laptop mockup container | Same container role as `browser-frame`; premium bezel, soft deep shadow |
| `cursor` | Animated pointer with click ripple | Spring-driven travel (`SPRING_SMOOTH`), single restrained ripple — no bounce |
| `code-diff` | Added / removed line reveal | Accent (`--onda-accent`) earned on the changed lines only |
| `notification` | Toast / banner slide-in | One travel of 12–24px, house easing; the entrance vocabulary applied to a UI surface |
| `keycap` | Keyboard shortcut display | Onda-original; small, typographic, pairs with `cursor` for input demos |
| `progress-steps` | Stepper / multi-step progress | Calm fill, accent on the active step only |

### Contract notes specific to A

- **`code-block` highlighting is pre-tokenized.** Shiki (or equivalent) runs at parse/build, never in render — render reads a static token array. This keeps frame N renderable with zero async and zero knowledge of other frames (§1). This is the *render-side* code block — distinct from the site's MDX→Shiki→CodeBlock pipeline (CLAUDE.md §5), which highlights docs, not video.
- **`browser-frame` / `device-frame` are containers.** They accept children/a content layer rather than owning content. This is the one documented exception to "self-contained" — a frame whose job is to wrap. They compose *down* (wrap arbitrary content), never *sideways* (no imports of sibling Onda components).
- **Uniformity holds.** Each supports `placement`, `size`, `fontFamily` per the real-library-uniformity rule. No tiered carve-outs.

### Notes on scope for A

- **High-energy effects are welcome — in their natural home.** Glitch, matrix-decode, RGB-split and similar are expressive *text/graphics* effects, not interface surfaces; they ship as entries in the `entrances` / `graphics` categories (or as transition variants), built to Onda's quality bar. They are not excluded — just categorized where they belong rather than forced into `interface`.
- **No `style` / `className` escape hatch** on any frame or surface. If a consumer reaches for arbitrary CSS repeatedly, that's a missing typed prop to surface and ship — not a hole to leave open (report-don't-escape-hatch).

-----

## Workstream B — Template compositions (→ spec 024)

Assembled, opinionated multi-scene videos that compose existing components + transitions into a ready-to-render whole. The agent (or human) starts from a finished shape and customizes via props, rather than wiring scenes from scratch.

### Catalog (proposed)

| Name | Composes | Shape |
| --- | --- | --- |
| `product-launch` | title-card → feature beats → end-card, with transitions | Hero launch reel |
| `changelog` | chapter-card per change + `code-diff` / `code-block` | Release-notes video |
| `feature-spotlight` | callout + stat-card + ken-burns | Single-feature focus |
| `code-walkthrough` | `terminal` + `code-block` + `cursor` (Workstream A) | Dev demo — depends on A |
| `stat-rollup` | count-up + bar-chart + pie-reveal | Metrics recap |
| `quote-reel` | quote-card sequence with transitions | Testimonial / social reel |

### Sub-contract for B

Templates are **not** ordinary components — they intentionally import other Onda components, which the standard contract forbids. They get their own sub-contract, mirroring how transitions diverged (017):

- Live under `registry/templates/<name>/` with the familiar layout (`.tsx`, `schema.ts`, `meta.json`, `README.md`, registry entry).
- A template's Zod schema describes *high-level* props (copy, brand color, logo, canvas preset) — not every child prop. Sensible defaults render a complete video with zero config.
- README usage snippet shows the template inside a `<Composition>`, with the canvas preset it's tuned for.
- New `templates` category in the registry; surfaced as a first-class group in the discovery surfaces (Workstream C) and the docs site.

### Open scope for B

- **Distribution decision (the 013 open question).** CLI-installed source (`bunx ondajs add changelog`) vs static demo JSON payloads. Leaning CLI-installed source — consistent with the copy-in model, and a template *is* source you own and edit. Spec 024 locks this.

-----

## Workstream C — Agent-native discovery (→ spec 025)

The helpers exist; nothing publishes them. This workstream wires built infrastructure into canonical, static artifacts — minimal new logic, mostly generation + routing.

- **`llms.txt` + `llms-full.txt`** at the site root, generated at build from the runtime manifest (018) + `summarizeRegistryAsMarkdown` (013). `llms.txt` is the index (what Onda is, categories, how to install, where the full surface lives); `llms-full.txt` is the complete component/transition/template surface with props.
- **Machine-readable registry route.** A stable JSON endpoint (building on the existing `www/public/r/*.json` manifests) that an agent can fetch to enumerate every entry, its schema, category, and install command. One canonical URL, versioned with the package.
- **Installable authoring skill.** A repo-shipped guide (skill / `AGENTS.md`-style) that teaches an agent how to compose Onda well: the contract, the motion essentials, the canvas presets, how to assemble scenes with transitions, when to reach for a template. Installable so it travels into a consumer's repo alongside the components.

### Non-goals for C

- **No MCP server (yet).** A fetchable `llms.txt` + JSON registry covers discovery without a running service to maintain. Revisit only on concrete demand.
- **No bespoke per-model tuning.** The JSON Schema (013) already feeds OpenAI structured-output and Anthropic tool-use. C publishes; it does not fork per provider.

-----

## Workstream D — Foundational primitives, helpers & hooks (→ spec 026)

Not a fixed catalog — a **continuously-fed** workstream. While building A and B (and from the prior-art audit), contributors will hit capabilities Onda doesn't yet have: a shared glass-surface primitive the frames and `code-block` both need, a seeded-noise helper, a `useStagger` / `useSceneProgress` hook, a layout primitive for grids. The rule: **ship the reusable piece, don't inline a one-off.**

- **Helpers and hooks live in `lib/`** — pure, deterministic (§1), no `useState`/`useEffect`-driven motion. They sit alongside the existing `lib/` modules (`motion.ts`, `easing.ts`, `choreography.ts`, `text-timing.ts`, …).
- **User-facing primitives go in the registry** under the category they belong to, following the component contract.
- **Capability-floor parity drives intake.** Anything a peer enables that Onda can't currently express becomes a D ticket: identify the missing primitive/helper/hook, ship it brand-filtered, then the blocked A/B/transition work unblocks on top of it.
- **No non-deterministic or inlined hacks** to route around a gap. A missing capability is a signal to ship a primitive, never to reach for `Math.random()` / `Date.now()` / state (§1) or copy-paste a one-off across entries.

This workstream has no "done" — it's the mechanism that keeps the floor at parity as A, B, and the transition audit surface needs.

-----

## Already in place (foundation — do not rebuild)

- **Transitions** — 017 shipped all 12 (`registry/transitions/`). Templates (B) compose them; nothing new needed.
- **Agent-helper layer** — 013 shipped `composition-json-schema.ts`, `registry-summary.ts`, `canvas-presets.ts` in `lib/`. C publishes their output; it does not re-derive it.
- **Runtime manifest** — 018. The single source the discovery artifacts (C) generate from.
- **`kind` discriminator** — 021. Every schema self-identifies, so an agent enumerating the manifest gets an exhaustively-typed union for free.

## Goals

- A developer making a code/terminal/product-demo video stays inside Onda end to end (Workstream A).
- An agent asked for a common video type starts from an opinionated, complete composition and customizes via props (Workstream B).
- An agent landing on the site or repo has one canonical, machine-readable entry point describing the entire surface and how to compose it (Workstream C).
- Onda serves real video production: the catalog spans calm-to-high-energy registers, so editors and agents get range without leaving Onda.
- Anything a peer enables, an Onda user can build — missing primitives, helpers, and hooks get shipped, not worked around (Workstream D).
- Every net-new entry reads as unmistakably Onda — premium, intentional, crafted — with zero configuration. Calm is the *default*; the catalog's range is wider.
- Each workstream ships incrementally, one entry/branch at a time per CLAUDE.md §5; no big-bang merge.

## Non-goals

- **Parity for parity's sake.** We do not ship an entry just because a peer has one. Each must carry Onda character — which is a *craft* bar, not a calmness bar.
- **Cheap or sloppy effects — at any energy level.** The gate is quality and intent, not energy. A high-energy effect built to Onda's bar ships; a gimmicky or half-tuned one doesn't.
- **Style / className escape hatches.** Customization is typed props → external wrapper → fork the installed file. Motion identity is the moat; escape hatches let it leak.
- **A monolithic mega-merge.** This umbrella sequences work; it does not bundle it into one PR.
- **Business / competitive positioning in this doc.** Capability framing only — strategy stays out of committed files (public repo).

## Reasonable calls (challenge any)

- **Umbrella spec + three child specs**, not one giant implementation doc. The codebase convention is single-concern specs (017, 013, 021). A program doc that frames and sequences, with implementation detail pushed into 023–025, honors both the "big" ask and the convention. The alternative — one spec covering three independent surfaces — would be unreviewable and couple unrelated work.
- **`interface` as the new category name** (Workstream A), over `dev` or `surfaces`. It reads as a peer to `data`, `media`, `cinematic` and doesn't pin the category to a single audience.
- **Frames are the documented exception to "self-contained."** `browser-frame` / `device-frame` exist to wrap content; forbidding children would make them useless. They wrap *arbitrary* content, never sibling Onda components — the no-sideways-import rule still holds.
- **Templates get a sub-contract, not the component contract.** A template *is* a composition of components; pretending otherwise (inlining everything to stay "self-contained") would duplicate the catalog and drift. Mirrors the transitions precedent (017).
- **Workstream A before B.** `code-walkthrough` (B) depends on `terminal` / `code-block` / `cursor` (A). Build the primitives, then the template that assembles them.
- **C is generation, not new runtime.** Publishing static `llms.txt` + JSON from the manifest avoids standing up a service. The helpers already produce the content; C routes it.
- **`code-block` highlights outside render.** Pre-tokenizing keeps §1's determinism intact. Highlighting in render would mean async/stateful work on a frame — a hard-rule violation.

## Sequencing

1. **Lock this umbrella.** Agree the four workstreams, catalogs, and category names.
2. **Transitions audit.** Diff 017's catalog against the ecosystem (per the operating principle) and queue the gaps — full range, quality-gated. Cheap to do, and it validates the prior-art-lookup workflow before the bigger workstreams lean on it.
3. **Spec 023 — dev-surface (A)** and **Spec 026 — primitives/helpers/hooks (D)** run together. A surfaces the capability gaps; D ships the primitives that unblock them. Reference implementation first (`code-block` — exercises the full `interface` contract incl. pre-tokenized highlighting), then parallelize one-per-branch.
4. **Spec 025 — agent discovery (C).** Parallel with A/D — it generates from the *existing* manifest, so it delivers value before new entries land and picks them up automatically as they ship.
5. **Spec 024 — templates (B).** Last; depends on A's primitives for `code-walkthrough` and benefits from C's discovery surface being live.

## Delivered so far (uncommitted, pending review)

Several execution passes, ahead of the formal child specs. Everything is on disk but **uncommitted** (left for local review). All `tsc --noEmit` clean (root + www). The 4 showcases have been eyeballed; individual components are typecheck-verified but **not all render-verified**.

**Foundation (Workstream D) — shipped as installable CLI lib modules (`lib-tokens`, `lib-random`, `lib-elevation`, `lib-hooks`, `lib-primitives`):**
- `lib/elevation.ts` — `RADIUS`, `SHADOW`, `SHEEN`, `GLOW`, `BLUR`, `GRAIN_OPACITY`.
- `lib/hooks.ts` — `useEntrance`, `useStaggeredEntrance`, `useSpringValue`, `useSceneProgress`, `useSeededRandom`, `useTextReveal`.
- `lib/primitives/` — `Surface`, `Glow`, `GridField`. All re-exported from `lib/index.ts`.

**Components — 18 new (registry now 60 components + 15 transitions = 75 items), all registered + manifested (`registry/r/*.json`) + preview-wired (`LivePreview.tsx`):**
- Typography / graphics: `shimmer-sweep`, `tracking-in`, `text-fade-replace`, `matrix-decode`, `rgb-glitch-text`, `slot-machine-roll`.
- `interface` category (new): `code-block`, `terminal`, `browser-frame`, `progress-steps`, `cursor`, `code-diff`, `device-frame`, `pulsing-indicator`.
- Data: `line-chart`. Atmosphere / graphics: `mesh-gradient`, `dynamic-grid`, `spotlight-card`.

**Transitions — 3 new (→ 15 total):** `chromaticAberration`, `gridPixelate`, `glassWipe`. Closes the audit's transition gaps.

**Showcases — 4 new (`www/src/showcase/`):** `dev-demo` (doubles as a transitions reel), `changelog`, `product-launch`, `live-metrics`.

**Site / agent discovery (Workstream C):** `scripts/generate-llms.mjs` → `www/public/llms.txt` + `llms-full.txt`; components page chip filter + `interface`/`media` category sections; TryIt panel hides the `kind` row.

**Docs:** "What's in Onda" overview (`docs/catalog.md` → `/docs/catalog`); `composing-with-onda` split into 5 subpages (overview + placement / timeline / media / agent-helpers); sidebar regrouped (Start / Foundations / Composing / Reference); `component-reference.md` surfaced as "Component contract".

## Remaining backlog (priority order)

1. **Verify + commit** — nothing is committed; components need a render pass before merge.
2. **Workstream B — templates** (installable compositions, e.g. `npx ondajs add changelog`). The biggest remaining lane; Onda has zero. Needs the `templates` sub-contract designed first (a 024 spec). The 4 showcases prove the patterns.
3. Lower-priority dev-surface from the audit (several may fit better as showcases than catalog entries): `code-accordion`, `dynamic-split-screen`, `bento-grid`, `toast`/`notification`, `data-flow-pipes`, `drag-and-drop-flow`.
4. Remaining primitives / typography: `success-confetti`, `brush-stroke`, `bounding-box-selector`, `perspective-marquee`.
5. Docs polish: deepen Getting Started (intro / install / first-render).

The detailed prior-art gap map (the specific ecosystem comparison) is kept **off** public paper per the public-repo rule — it lives in the agent's private memory.

## Open questions

1. **Category name `interface` — final?** Or split frames (`browser-frame`, `device-frame`) into a `containers` notion? Leaning single `interface` category; revisit if it gets crowded.
2. **`code-block` highlighter dependency.** Shiki (matches the site, heavier) vs a lighter tokenizer for the render path. Determinism is the hard requirement either way; the choice is bundle weight. Spec 023 decides.
3. ~~**Template distribution (B).**~~ **Withdrawn** — Workstream B is dropped (see the dated update below). There are no templates to distribute; showcases are demonstration-only and not installable.
4. **`llms.txt` hosting** at site root vs a generated public file in `www/public`. Both are static; pick whichever the Next build serves most cleanly. Spec 025 decides.
5. **Does the authoring skill (C) ship in-repo only, or also installable** into a consumer's project via the CLI? Leaning both — in-repo as source of truth, installable so it travels with the components.

-----

## Update — 2026-05-25: Workstream B dropped; completeness build executed

**Workstream B (template compositions) is dropped — not deferred.** Onda will not ship installable, assembled multi-scene videos. The role B was meant to serve — give an author/agent a complete, opinionated whole to start from — is met by the **showcase corpus** (`www/src/showcase/`), which is **demonstration-only**: site-rendered to prove the catalog combines into something great, never installed as a unit. The library ships the *pieces*; assembling them is the consumer's (or their agent's) job, with showcases as the worked examples. The `templates` sub-contract, the `templates` registry category, and the template-distribution question are all withdrawn.

**Capability audit → just-in-time build.** A prior-art capability audit (the specific ecosystem comparison is kept off public paper per the public-repo rule) mapped a set of target showcases to the catalog and surfaced the gaps below. Each gap was shipped brand-filtered as a reusable primitive (Workstream D) rather than worked around, then exercised by a new showcase.

- **New `lib/` primitive:** `Camera` + `useCameraRig` — a render-safe **2D** camera (pan / zoom / roll over an oversized world). No `preserve-3d`; depth is faked with layering, dodging Remotion's nested-3D render caveats. Powers the camera-move showcases without a fragile 3D rig.
- **New components:** `confetti`, `bento-grid`, `node-graph`, `kanban-board`, `split-screen`, `pricing-card`, `input-field`, `skeleton-card`, `button`, `bounding-box`.
- **New transitions:** `type-mask`, `device-pullback`, `expand-morph` (all no-overshoot per §3 — an intentional divergence from bouncier ecosystem equivalents).
- **New showcases (13):** `changelog-loop`, `deploy-reveal`, `annotated-click`, `browser-walkthrough`, `bento-drift`, `device-assemble`, `launch-trailer`, `integration-orbit`, `board-flow`, `dashboard-fill`, `prompt-to-dashboard`, `pricing-focus`, `code-to-preview`.

**Totals now:** 70 components, 18 transitions, 30 showcases, 103 CLI manifests. Root + `www` both `tsc --noEmit` clean; determinism-clean (no `Math.random`/`Date`/state-driven motion); `registry.json`, per-slug manifests, and `llms.txt`/`llms-full.txt` regenerated. **Still uncommitted and not yet render-verified** — the showcase render pass (on the docs site) is the next gate before commit.
