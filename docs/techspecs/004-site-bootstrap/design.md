# Techspec 004 — Site bootstrap

## Problem

After [003](../003-walking-skeleton/design.md) we have a working Remotion library on disk: `BlurReveal` renders, the registry shape exists, `pnpm typecheck` is green. But the only way to *see* a component is via Remotion studio, which:

- has no Onda visual identity (renders against the studio's default chrome);
- doesn't help anyone discover what Onda is or what it offers;
- doesn't double as a place to ship docs;
- isn't where the user wants to work — the site is meant to be the lab.

Onda's identity is the moat. To ship that identity, the site has to *be* a piece of motion graphics — landing surface, component showcase, and documentation, all in one. Until the site exists, every motion decision is being judged against Remotion studio's preview, which is the wrong context.

Workflow signal from the user: `@remotion/player` embedded in component pages replaces Remotion studio as the primary preview surface going forward.

## Decision

**Build `/www` as a custom Next.js 15 app (App Router) with MDX. No docs framework — not Nextra, not Fumadocs, not Docusaurus.**

The site has two surfaces, built from the same foundation:

1. **Landing page** — hero with signature motion, install snippet, why-Onda, link to docs.
2. **Component docs surface** — `/components/[slug]` template, hydrated from the registry, with embedded `@remotion/player` per component.

The registry is the source of truth: a new component dropped under `/registry/components/<name>/` should appear on the site without manual duplication.

## Why no docs framework

| Framework | Why not |
| --- | --- |
| Nextra | Strong layout opinions; hard to override enough to feel like Onda; weak at marketing surfaces. |
| Fumadocs | More headless than Nextra but still imposes structure we'd fight; adds a dependency to our most-touched surface. |
| Docusaurus | Not Next.js; we'd have two React frameworks in the repo. |
| Mintlify | Proprietary, hosted. Not aligned with an open-source library. |

A custom site costs us prebuilt nav / sidebar / TOC and a search story. Those are 1–2 days of work to rebuild, and we don't need search until the catalog has dozens of items. Framework lock-in is forever; the rebuild cost is one-time.

## Goals

1. `pnpm --filter www dev` opens a Next.js dev server with a working landing page and a working `/components/blur-reveal` page.
2. The landing page demonstrates the Onda identity end-to-end: dark canvas, Clash Display + Space Grotesk, dusty rose accent used sparingly, a signature motion in the hero, generous negative space.
3. The component docs page renders `BlurReveal` live and scrubbable via `@remotion/player`, with prop documentation pulled from the registry, the install snippet (`npx onda add blur-reveal`), and the README rendered as MDX.
4. `/lib/tokens.ts` is exposed to the site as CSS variables — the site uses the same canonical tokens as the components. Divergence between site styling and `lib/tokens.ts` is a bug.
5. The repo becomes a pnpm workspace; `/www` is a workspace child. The root continues to be the library; `/www` is the site.
6. No duplication of component metadata between `/registry` and `/www` — the site reads from the registry.

## Non-goals

- **A motion showcase page** beyond the landing hero. Later.
- **A full multi-component nav/sidebar.** One component doesn't justify it. Add when the catalog has ~5.
- **Search.** Premature at this size.
- **Versioning, i18n, theming / light mode.** Onda is dark-only and English-only by design (for now).
- **Analytics, auth, comments, ratings.** Not the product.
- **Deploy infra** (Vercel project, custom domain, CI). Separate techspec when we're ready to ship publicly.
- **Refining the motion language.** Still techspec 005 — use current opinions for the hero and revise after research.
- **The `npx onda` CLI.** Still techspec 006.

## Reasonable calls (challenge any of these)

- **Framework:** **Next.js 15, App Router, TypeScript, React Server Components by default.** Client components only for interactive surfaces (`@remotion/player`, copy buttons).
- **Styling:** **Tailwind 4 with strict theme config.** `theme.extend` reads from `/lib/tokens.ts` (colors, spacing 8/16/24/32…, fonts). Tailwind covers layout / responsive / state utilities. **Don't** use Tailwind for arbitrary values that should be tokens. (Vanilla CSS modules is a reasonable alternative — wins on identity purity, loses on responsive ergonomics. Going Tailwind for productivity.)
- **MDX:** **`next-mdx-remote`** for rendering component READMEs and any prose pages. **`shiki`** for syntax highlighting (we can later theme it with the Onda accent for highlights).
- **Fonts:** **`next/font` self-hosted** under `/www/public/fonts/`. Clash Display from [Fontshare](https://www.fontshare.com/fonts/clash-display) (free for commercial use). Space Grotesk from [Google Fonts](https://fonts.google.com/specimen/Space+Grotesk) (OFL). License verification is on the user before shipping publicly.
- **Workspaces:** **pnpm workspaces.** `pnpm-workspace.yaml` at root, `/www` as the first child. Root `package.json` keeps Remotion / Zod / TS as the library deps; `/www/package.json` adds Next.js, React, Tailwind, MDX, `@remotion/player`.
- **Routing:**
  - `/` → landing
  - `/components` → grid of all components (auto-generated from the registry)
  - `/components/[slug]` → component page (auto-generated from `/registry/components/<slug>/`)
- **Source-of-truth pattern.** A `lib/registry.ts` helper inside `/www/src/` reads `/registry/registry.json` and the per-component metadata files at build time. The site is just a renderer over that data.

## Open questions deferred

- **Where does the hero animation live?** Two paths: (a) a one-off Composition under `/registry/scenes/landing-hero/` as a first-party site asset; (b) reuse `BlurReveal` directly in the player. **For 004 we pick (b)** — landing reuses BlurReveal as the hero, proving the embed works. Custom landing scenes belong in a later techspec.
- **`@remotion/player` performance.** Each component page bundles the Remotion runtime. Fine for one component; at scale we'll want to lazy-load. Defer until it hurts.
- **CSS variables vs Tailwind tokens — single source.** `/lib/tokens.ts` is canonical; a small helper in `/www/src/lib/tokens-css.ts` emits the matching CSS variables for `:root` and the values for the Tailwind theme config. One source, two consumers. Wire it manually for 004; automate later if tokens shift more than once.

## Renumbering note

This techspec pulls forward what was loosely planned as "the docs site" later in the sequence. **New techspec order:** 004 site bootstrap → 005 motion-principles research → 006 CLI → 007 primitive catalog buildout. Earlier mentions in other techspecs' "out of scope" sections reference older numbers and don't need retroactive edits — [logging.md](../logging.md) is the canonical sequence.
