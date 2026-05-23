# Roadmap — Techspec 002

This techspec captures a decision and reframes the existing docs. The CLI and docs-site registry surface are downstream work tracked in their own techspecs.

## M1 — Reframe positioning across all docs — Done

Replace shadcn-as-vehicle framing with our own across the existing docs surface, while preserving the "source-is-yours" philosophy.

**Acceptance:**

- `README.md` install line is `npx onda add <name>` (no `@onda/` namespace, no `shadcn`). ✅
- `README.md` tagline does not contain "shadcn for video" or similar. ✅
- `docs/vision.md` positioning sentence does not reference shadcn as our vehicle; the distribution model paragraph links to this techspec. ✅
- `docs/tech-stack.md` distribution section reflects: our CLI as primary, shadcn registry JSON shape as the on-disk format (compatibility bonus), website as copy-paste registry. ✅
- `CLAUDE.md` preamble reflects the new install path and does not call us "shadcn-style." ✅
- `docs/techspecs/logging.md` lists this techspec at the top. ✅

## Out of scope (later techspecs)

- **Implementing the `npx onda` CLI.** Belongs after the registry scaffolding techspec — the CLI consumes the registry, so the registry needs a shape first.
- **Implementing the `/r/<name>.json` URLs on the docs site.** Belongs with the `/www` bootstrap techspec.
- **Formal Zod schema for `registry.json` and per-component JSON.** Belongs with registry scaffolding — the schema is part of defining the registry.
- **`@onda` npm namespace.** Not used by the CLI (the name `<name>` is a registry key, not an npm package). If we ever publish anything to npm — the CLI itself, or a `@onda/runtime` shared lib — that's a separate decision.
