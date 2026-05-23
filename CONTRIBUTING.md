# Contributing to Onda

Thanks for your interest in Onda. Components are the core of this library, and we welcome both bug fixes and new component proposals — provided they stay inside the motion language.

## Quick start

```bash
git clone https://github.com/degueba/onda.git
cd onda
pnpm install
pnpm dev           # Remotion Studio
pnpm --filter @onda/www dev   # docs site
pnpm typecheck     # tsc --noEmit across both packages
```

You'll need Node 20+ and pnpm 9+.

## Before you open a PR

**Read the two contracts.** They're short and they encode everything that keeps the catalog coherent:

- [CLAUDE.md](CLAUDE.md) — the hard technical rules (no `Math.random`, no `useState`/`useEffect` for animation, deterministic-rendering invariants), the tokens, and the motion essentials.
- [docs/component-reference.md](docs/component-reference.md) — the four-file component contract every primitive ships in.

A PR that violates the hard rules (§1 of CLAUDE.md) will be closed without review. A PR that uses bouncy springs, sprinkled accent color, or hard-coded values where tokens exist will be sent back for revision.

## What we accept

| Type | What we look for |
| --- | --- |
| **Bug fixes** | A failing case, a fix, a one-line PR description explaining the cause. |
| **New components** | Open an **issue first** with a one-paragraph proposal: name, category, problem it solves, motion approach. We'll discuss fit with the catalog before any code lands. |
| **Component improvements** | Tighter defaults, better prop ergonomics, accessibility fixes. Keep behavior the same unless documented. |
| **Documentation** | Typos, clarifications, examples — always welcome. |

## What we don't accept

- Components that lean on confetti, sparkles, glitch, RGB-split, particles, spinning, neon glow, or other "showy" effects. Restraint is the brand — see CLAUDE.md §3.
- "Improvements" to the motion tokens (springs, durations, easing). The token values ARE the library's signature; they don't change without a deliberate techspec.
- New dependencies on the lib/ side. Adding to `package.json` for a primitive needs a strong justification.
- Auto-generated PRs from LLM tooling without a human reviewer who can defend the decisions.

## Branch + PR conventions

- Branch from `main`. One component (or one fix) per branch — never two.
- Conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Run `pnpm typecheck` locally before pushing. CI runs it on every PR.
- Run `pnpm sync-registry` if your change touches `registry/components/*/meta.json` — it regenerates `registry/registry.json` from the per-component metas.

## License

By submitting a contribution, you agree it's licensed under the project's [MIT license](LICENSE).

## Code of conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md). In short: be kind, assume good intent, focus on the work.
