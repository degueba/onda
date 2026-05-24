# Changelog

All notable changes to Onda will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release of the Onda catalog: **38 components** across 6 categories (Entrances 12 · Data 6 · Graphics 5 · Atmosphere 3 · Cinematic 5 · Scenes 7).
- Shared motion language in `lib/`: `DURATION`, `SPRING_SMOOTH`, `SPRING_SNAPPY`, `STAGGER`, `staggerFrames`, `HOUSE_EASE`, `seededRandom`, choreography helpers (`entryFade`, `entrySlide`, `entryScale`, `entryFadeRise`, `exitFadeFall`, `heroReveal`, `stateSwap`), and design tokens (`COLOR`, `FONT`, `SPACING`).
- `ondajs` CLI (`packages/cli/`) — `npx ondajs add <slug>`, `npx ondajs list`, with transitive `registryDependencies` walking and import-path rewriting for `@/*` aliases.
- Docs site at `onda.video` — landing page, component catalog with live `<Player />` previews and props panels, `/docs` getting-started guide, `/compare` matrix, `⌘K` search.
- Brand mark (Mercury wave) — animated React component (`BrandMark`, `BrandLogo`), static SVG assets (`assets/onda-*`), favicon, Apple touch icon.
- `pnpm sync-registry` script to keep `registry/registry.json` in lockstep with per-component `meta.json` files.

[Unreleased]: https://github.com/degueba/onda/compare/main...HEAD
