# Tech stack

- **Remotion + React + TypeScript** — the rendering substrate.
- **Zod** for all component props. The Zod schema is also our future training-data schema — treat it as first-class.
- **Distribution:** components install as source into the user's project — never imported as a black-box dep.
  - **Primary CLI:** `npx onda add <name>`, our own thin CLI. No `components.json`, no project init.
  - **Registry format:** we adopt the [shadcn](https://ui.shadcn.com) registry JSON shape (`registry.json` + per-component JSON under `/r/`) because it's a sensible spec. The shadcn CLI working against our registry is a compatibility bonus, not a requirement.
  - **Copy-paste fallback:** every component on the docs site has a copy button + a stable `/r/<name>.json` URL for scripted / curl use.
- **Docs site:** Next.js on Vercel (free tier), with `@remotion/player` live, scrubbable previews per component (lazy-loaded, short loops for performance).
- **License:** MIT.

## Repo layout (target)

```
/registry            # the components (the product)
  /components
  registry.json
/www                 # Next.js docs + showcase site
/lib                 # shared utils, seeded PRNG, easing helpers, tokens
/docs                # vision, philosophy, motion, reference, roadmap, techspecs
CLAUDE.md            # agent-facing rules (tokens, hard rules, contract, workflow)
README.md            # human-facing intro
```
