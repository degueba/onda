# Techspec 001 — Project foundation

## Problem

The repo is brand new. The only authored artifact is a dense `CLAUDE.md` that mixes three different audiences into one document:

1. **Agent-facing operational rules** that must be in context every run (hard technical rules, design tokens, component contract, workflow rules).
2. **Human-facing context** about what Onda is, why it exists, and how it looks (vision, design philosophy, tech stack).
3. **Product planning** (v1 scope, primitives list, scene blocks list).

Mixing these is expensive — every agent invocation pays the token cost of vision prose and example code it doesn't need to do its job — and it's brittle: there is no place for design or planning artifacts to grow without bloating `CLAUDE.md` further.

We also have no documentation convention yet. Future work needs a predictable home so multiple agents can collaborate without colliding.

## Goals

1. Establish the **docs convention** for the project: per-initiative techspec folders, plus a small set of stable reference docs.
2. Slim **`CLAUDE.md`** to only what agents need every run: hard rules, tokens, contract skeleton, motion essentials, workflow + self-check. Everything else moves out under links.
3. Create a **`README.md`** that introduces Onda to humans landing on the repo.
4. Extract the non-agent-essential content of the current `CLAUDE.md` into focused docs (`vision`, `design-philosophy`, `motion-language`, `component-reference`, `tech-stack`, `product-roadmap`).

## Non-goals

- Writing any component code. v1 component work is downstream.
- Setting up the registry, the `www/` Next.js site, or any build tooling.
- Picking the next techspec. Roadmap sequencing is a separate decision.

## The docs convention

```
docs/
  README.md                       # index of /docs
  vision.md                       # what Onda is / is not, the differentiator
  design-philosophy.md            # Apple discipline + Onda surface
  motion-language.md              # the motion fingerprints (the moat)
  component-reference.md          # contract + the BlurReveal reference implementation
  tech-stack.md                   # stack + target repo layout
  product-roadmap.md              # v1 primitives + scene blocks
  techspecs/
    logging.md                    # index of all techspecs, most recent first
    NNN-<slug>/
      design.md                   # the decisions and shape of the change
      roadmap.md                  # execution plan / milestones
      logs.md                     # running activity log, most recent first
```

### Rules of the convention

- **Techspec folders are sequentially numbered.** `001-project-foundation`, `002-…`, etc. The number is permanent once assigned.
- **`design.md` is the contract.** It states the problem, goals, non-goals, and shape of the solution. Reviewed before execution.
- **`roadmap.md` is the plan.** Ordered milestones with explicit acceptance criteria. Updated as work lands.
- **`logs.md` is the journal.** Append at the top — every meaningful session writes a dated entry: what was done, what was learned, what changed.
- **`techspecs/logging.md` is the index.** New techspecs go at the top. Status moves from `Planned → In progress → Done` (or `Abandoned`, with a one-line reason).
- **No content lives only in `logs.md`.** If a decision is durable, it lands in `design.md` (or a stable doc) too. Logs are for narrative; design is for truth.

## What stays in `CLAUDE.md`

Only what every agent needs to do its job correctly **on every invocation:**

- A one-paragraph statement of what Onda is, with links out for full context.
- **Hard technical rules** (Remotion determinism — `Math.random`, `Date.now`, `useState/useEffect`, SSR, `<Sequence>`/`<AbsoluteFill>`, `@remotion/media`).
- **Design tokens** (color, type, spacing, surface-polish values). Small, canonical, referenced by every component default.
- **Motion essentials** (house spring config, house easing curve, timing ranges, "calmer not flashier" rule). The full prose lives in `docs/motion-language.md`.
- **Component contract skeleton** (file layout, the seven MUSTs). The full reference implementation lives in `docs/component-reference.md`.
- **Workflow rules + self-check** for parallel agents.
- A **"see also"** pointer block to `README.md`, `docs/`, and the techspecs index.

## What moves out of `CLAUDE.md`

| Was in `CLAUDE.md` | Lands in |
| --- | --- |
| §1 What Onda is, positioning, "what we're not building" | `docs/vision.md` (+ a one-paragraph echo in `README.md`) |
| §2 Design philosophy — Apple discipline / Onda surface | `docs/design-philosophy.md` |
| §3 Design tokens — color/type/spacing/surface polish | **Stays in `CLAUDE.md`** (essential every run) |
| §4 Motion language — full prose | Tightened in `CLAUDE.md` → essentials only; full version at `docs/motion-language.md` |
| §5 Hard technical rules | **Stays in `CLAUDE.md`** verbatim |
| §6 Component contract — skeleton | **Stays in `CLAUDE.md`**; the full reference implementation moves to `docs/component-reference.md` |
| §7 v1 scope (primitives + scene blocks) | `docs/product-roadmap.md` |
| §8 Tech stack + repo layout | `docs/tech-stack.md` (+ short stack summary in `README.md`) |
| §9 Workflow rules + self-check | **Stays in `CLAUDE.md`** verbatim |

## `README.md` shape

Short and sales-y for humans landing on GitHub: tagline, one-paragraph "what it is," one install line, the *why* (signature motion identity), pre-v1 status, links to docs, license. No catalog tables yet — those land when there are components to list.

## Open questions deferred to later techspecs

- **`/lib/tokens.ts` as canonical source of truth for tokens.** Right now `CLAUDE.md` is canonical; once `/lib` exists the tokens file should be canonical and `CLAUDE.md` should link to it. Defer until the registry scaffolding techspec.
- **Registry scaffolding** (`registry/`, `registry.json`, the shadcn JSON shape). Strong candidate for techspec 002.
- **`/www` docs site bootstrap.** Subsequent techspec.
