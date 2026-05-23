# Roadmap — Techspec 004

Execution plan for [design.md](design.md). Each milestone has explicit acceptance criteria. Update statuses as work lands.

## M1 — Workspace + `/www` scaffold — Done

Make the repo a pnpm workspace; bootstrap `/www` as a Next.js 15 app.

**Acceptance:**

- `pnpm-workspace.yaml` exists at the repo root listing `www` as a member. ✅
- `/www/package.json` declares Next.js 15.5, React 18.3, TypeScript 5.x, Tailwind 4, `@remotion/player`, `next-mdx-remote`, `shiki`. ✅
- `/www/tsconfig.json` is standalone (Next.js needs `jsx: preserve`, root uses `jsx: react-jsx`) with path aliases `@/*`, `@onda/registry/*`, `@onda/lib/*`. ✅
- `pnpm install` at the repo root resolves both workspaces successfully (`Done in 7.7s`, +161 packages). ✅
- `pnpm --filter www build` produces an optimized production build. ✅ (5 static routes + 1 dynamic; the visual dev-server scrub is the remaining interactive check.)
- `pnpm --filter www typecheck` passes. ✅

## M2 — Design system layer — Done

Make the Onda identity available to the site as CSS variables + Tailwind tokens, with fonts loaded.

**Acceptance:**

- Tokens exposed via Tailwind 4's `@theme` block in `/www/src/app/globals.css` — colors, fonts, and an `--spacing: 0.5rem` base so the 8px scale aligns to `p-1, p-2, …`. ✅ Doc-only mirror of `lib/tokens.ts` (comment flags divergence as a bug — a generation script is deferred).
- The CSS is loaded via `import './globals.css'` in `layout.tsx`. ✅
- **No `tailwind.config.ts`** — Tailwind 4 is CSS-first. Theme tokens live in `@theme`, no JS config needed. (Diverges from the original design.md scope.)
- Space Grotesk loaded via `next/font/google` (build-time optimized). Clash Display loaded via the [Fontshare](https://api.fontshare.com) CDN `<link>` from `layout.tsx` head. **Public/fonts self-hosting deferred** — both fonts resolve immediately; self-host is a perf optimization for later.
- Default `<body>` background is `--color-onda-bg`; default text color is `--color-onda-text`; `color-scheme: dark` prevents browser-UI flash. ✅

## M3 — Landing page — Done

Build `/`. Hero with signature motion, install line, why-Onda, links into docs.

**Acceptance:**

- `/www/src/app/page.tsx` renders the landing. ✅
- Hero uses `@remotion/player` (via `ComponentPreview` → `LivePreview`, dynamic-loaded with `ssr: false`) to play a `BlurReveal` of the word "Onda" at fontSize 240, delay 8, duration 22 — autoplay, loop, no controls. ✅
- Install snippet visible: `npx onda add blur-reveal` with a `CopyButton`. ✅
- Why-Onda paragraph adapted from [docs/vision.md](../../vision.md), with the dusty rose accent on the words "signature motion identity" — the section's one accent. ✅
- CTA row: "Browse components →" (filled, white-on-dark) and "GitHub" (outline). ✅
- Generous negative space respected; 8px-aligned widths (`max-w-150` for the hero canvas, `max-w-80` for prose, `max-w-65` for the install snippet) — all derived from the spacing scale. ✅

## M4 — Component docs surface — Done

`/components` index + `/components/[slug]` template, hydrated from the registry.

**Acceptance:**

- `/www/src/lib/registry.ts` reads `/registry/registry.json`, per-component `meta.json`, and `README.md` at request time using Node `fs`. ✅
- `/www/src/app/components/page.tsx` renders an auto-generated grid (one card per registry item; one card today). ✅
- `/www/src/app/components/[slug]/page.tsx` renders the component page: title + description from the catalog, live preview via `LivePreviewSection` (client island, dynamic-loaded), `npx onda add <slug>` install snippet, README rendered as MDX with custom `.prose-onda` styles for the dark canvas. ✅
- `/components/blur-reveal` is the concrete first page and proves the template. ✅
- New components added under `/registry/components/<slug>/` appear in `/components` and at `/components/<slug>` without code edits — registry is the source of truth (✅ pattern, ⏳ untested with a second component since 003 ships only one).
- **The `[slug]` route is `force-dynamic`**, not statically prerendered. Static prerender hit a React-copy mismatch (Next.js 15.5 + React 18.3 + Player + MDXRemote interaction). Server-render-on-demand sidesteps it; performance is a non-issue at this catalog size. Revisit when bumping to React 19 (an own techspec).

## M5 — Nav + footer — Done

**Acceptance:**

- Top nav: "Onda" wordmark in Clash Display (links `/`), "Components" (links `/components`), "GitHub" (external). ✅
- Footer: MIT note + repo link in `--onda-faint`, restrained, no signup form, no analytics. ✅

## Out of scope (later techspecs)

- **Motion research / motion-language revision** — techspec 005. The hero motion in 004 uses current opinions and may be revised after 005.
- **The `npx onda` CLI** — techspec 006.
- **More components** — techspec 007.
- **Deploy infrastructure** (Vercel project, custom domain, CI) — separate techspec when we're ready to go public.
- **A custom landing scene Composition** — for 004 the landing hero reuses `BlurReveal`. First-party landing scenes belong in a later techspec.
- **Search, versioning, i18n, light mode** — premature.
