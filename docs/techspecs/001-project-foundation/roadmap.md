# Roadmap — Techspec 001

Execution plan for [design.md](design.md). Each milestone has an explicit acceptance criterion. Update statuses as work lands.

## M1 — Docs scaffold — Done

Create the new docs tree with all extracted content from `CLAUDE.md`.

**Acceptance:**

- `docs/README.md` exists and lists every doc. ✅
- `docs/vision.md`, `docs/design-philosophy.md`, `docs/motion-language.md`, `docs/component-reference.md`, `docs/tech-stack.md`, `docs/product-roadmap.md` exist and faithfully carry the corresponding content from the old `CLAUDE.md`. ✅
- `docs/techspecs/logging.md` exists and lists this techspec. ✅
- `docs/techspecs/001-project-foundation/{design,roadmap,logs}.md` exist. ✅

## M2 — Slim `CLAUDE.md` — Done

Rewrite `CLAUDE.md` so it contains only what every agent needs every run.

**Acceptance:**

- Hard technical rules, design tokens, component-contract skeleton, motion essentials, and workflow rules + self-check remain verbatim or in tightened form. ✅
- Vision, design philosophy, full motion prose, the reference implementation code block, tech stack, and v1 scope have been removed (now linked from `CLAUDE.md` as "see also"). ✅
- Final length is meaningfully shorter than the original (target: roughly half). ✅
- A "see also" block at the top points to `README.md`, `docs/`, and `docs/techspecs/logging.md`. ✅

## M3 — README — Done

Create the human-facing `README.md`.

**Acceptance:**

- One-line tagline + one-paragraph "what it is" + install line + "why Onda" + pre-v1 status + doc links + MIT note. ✅
- Doesn't duplicate operational rules from `CLAUDE.md`. ✅

## M4 — Verify nothing was lost — Done

Diff old `CLAUDE.md` against the union of new `CLAUDE.md` + extracted docs. Anything in the old file should still exist somewhere, or have been deliberately dropped (with the drop noted in `logs.md`).

**Acceptance:**

- An entry in `logs.md` lists any content that was deliberately removed (rather than relocated). ✅

## Out of scope (later techspecs)

- Registry scaffolding under `/registry`.
- `/lib` with `tokens.ts`, easing helpers, seeded PRNG.
- `/www` Next.js docs site bootstrap.
- Building any actual component.
