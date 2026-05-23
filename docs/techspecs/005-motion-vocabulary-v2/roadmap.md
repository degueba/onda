# Roadmap — Techspec 005

Execution plan for [design.md](design.md). Update statuses as work lands.

## M1 — Add new helpers to `lib/choreography.ts` — Done

Add `entryFade`, `entrySlide`, `entryScale` alongside the existing helpers. Match the existing return-style-object pattern. Re-use `SPRING_SMOOTH` and `HOUSE_EASE` from their canonical exports.

**Acceptance:**

- `entryFade({ frame, fps, delay?, durationInFrames? })` returns `{ opacity: number }`.
- `entrySlide({ frame, fps, delay?, durationInFrames?, direction, distance? })` returns `{ opacity: number, transform: string }`. `direction` is `'up' | 'down' | 'left' | 'right'`; `distance` defaults to `12`.
- `entryScale({ frame, fps, delay?, durationInFrames?, from? })` returns `{ opacity: number, transform: string }`. `from` defaults to `0.9`.
- All three use `SPRING_SMOOTH` to drive the 0 → 1 progress, then `interpolate` (clamped both ends) for opacity / transform values.
- Doc comments at the top of each helper explain when to use it and what motion fingerprint it carries.
- `pnpm typecheck` passes.

## M2 — Reconcile spring constants — Done

Remove `HOUSE_SPRING` from `lib/easing.ts` (verified unused via repo grep — only the export itself exists).

**Acceptance:**

- `lib/easing.ts` exports only `HOUSE_EASE`.
- A note in `lib/easing.ts`'s file-level comment points to `lib/motion.ts` for spring config (`SPRING_SMOOTH`, `SPRING_SNAPPY`).
- `pnpm typecheck` passes.

## M3 — Refactor existing primitives (parallel agents) — Done

Three parallel agents update `FadeIn`, `SlideIn`, `ScaleIn` to call the new helpers instead of inlining motion. Each agent works in its own component folder; no shared file edits.

**Acceptance:**

- `FadeIn` calls `entryFade` (replacing inline `interpolate` + `HOUSE_EASE`).
- `SlideIn` calls `entrySlide` (replacing inline `spring` + per-direction translate math).
- `ScaleIn` calls `entryScale` (replacing inline `spring` + scale math).
- Schemas, prop names, default values, and rendered output remain identical (refactor is functionally equivalent).
- Each component's README is updated to reference the helper it uses (under "Motion notes").
- `pnpm typecheck` passes after merge.

## M4 — Regenerate registry manifests + verify — Done

After the agent batch returns, regenerate `r/fade-in.json`, `r/slide-in.json`, `r/scale-in.json` from the refactored source (the embedded `content` strings are now stale). Build the site to confirm runtime behavior.

**Acceptance:**

- The three `r/<slug>.json` manifests reflect the post-refactor source.
- `pnpm --filter www build` produces all 6 component pages cleanly.
- A dev-server smoke test confirms `/components/fade-in`, `/components/slide-in`, `/components/scale-in` render and play correctly with no visible motion difference from before the refactor.

## Out of scope (later techspecs)

- New primitives or scene blocks.
- `BlurReveal`, `WordStagger`, `DrawOn` refactors (see design.md §"Refactor existing primitives" for why).
- Exit helpers (`exitSlide`, `exitScale`) — no demand yet.
- A unified `MotionStyle` return type.
- The CLI (`npx onda add`) — explicitly postponed by user direction.
