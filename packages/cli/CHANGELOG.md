# Changelog

## [0.9.2](https://github.com/degueba/onda/compare/ondajs-v0.9.1...ondajs-v0.9.2) (2026-06-17)


### Bug Fixes

* point site, registry, and homepage at remotion.onda.video ([#72](https://github.com/degueba/onda/issues/72)) ([8618c47](https://github.com/degueba/onda/commit/8618c47b56b85e5e94a704a71d55e39be88d81fd))

## [0.9.1](https://github.com/degueba/onda/compare/ondajs-v0.9.0...ondajs-v0.9.1) (2026-05-29)


### Docs

* **theme:** reframe motion as a tunable default, not a lock ([#65](https://github.com/degueba/onda/issues/65)) ([cf8f864](https://github.com/degueba/onda/commit/cf8f8645b7bda9a03b9fa83e89017ed9ea0ec74b))

## [0.9.0](https://github.com/degueba/onda/compare/ondajs-v0.8.0...ondajs-v0.9.0) (2026-05-29)


### Features

* **theme:** brand overrides via CSS-variable token contract ([#63](https://github.com/degueba/onda/issues/63)) ([b809e4c](https://github.com/degueba/onda/commit/b809e4c124a06feaad5204aae96cac8c7e331954))

## [0.8.0](https://github.com/degueba/onda/compare/ondajs-v0.7.1...ondajs-v0.8.0) (2026-05-29)


### Features

* **cli:** add exit choreography family ([2083b26](https://github.com/degueba/onda/commit/2083b26a33007d099c03458fb90b2f2a7a040751))

## [0.7.1](https://github.com/degueba/onda/compare/ondajs-v0.7.0...ondajs-v0.7.1) (2026-05-29)


### Docs

* document the ondajs/motion export ([f175a83](https://github.com/degueba/onda/commit/f175a833bfb652975d83344575bb54907d97ab07))

## [0.7.0](https://github.com/degueba/onda/compare/ondajs-v0.6.0...ondajs-v0.7.0) (2026-05-29)


### Features

* **cli:** add ./motion export for consumers ([5c8d487](https://github.com/degueba/onda/commit/5c8d4870f2060e8d72ceaecc40c796e03817d046))

## [0.6.0](https://github.com/degueba/onda/compare/ondajs-v0.5.1...ondajs-v0.6.0) (2026-05-28)


### Features

* **manifest:** pickWhen + composes for picking enrichment (027) ([#50](https://github.com/degueba/onda/issues/50)) ([1880411](https://github.com/degueba/onda/commit/1880411eaf30b5edfe33f3cd49f3a5b98871b827))
* **manifest:** typed schemas map alongside the array (closes [#52](https://github.com/degueba/onda/issues/52)) ([#55](https://github.com/degueba/onda/issues/55)) ([86dc80b](https://github.com/degueba/onda/commit/86dc80b42cb351bd6f238d514dd59ea904a362ee))
* **player:** adaptive player wrapper + mobile preview UX ([#53](https://github.com/degueba/onda/issues/53)) ([c4dfbdd](https://github.com/degueba/onda/commit/c4dfbdd2148abdd743f6074eb0bfcb6c9cd88b1d))

## [0.5.1](https://github.com/degueba/onda/compare/ondajs-v0.5.0...ondajs-v0.5.1) (2026-05-26)


### Bug Fixes

* **cli:** emit ondaTransitions registry in the barrel ([#45](https://github.com/degueba/onda/issues/45)) ([ea5d35a](https://github.com/degueba/onda/commit/ea5d35a071f54212e9305fc5c36e6f762f76569e))

## [0.5.0](https://github.com/degueba/onda/compare/ondajs-v0.4.1...ondajs-v0.5.0) (2026-05-25)


### Features

* 022 completeness program — 28 new components, 6 transitions, 18 showcases, agent discovery ([#29](https://github.com/degueba/onda/issues/29)) ([a01e46d](https://github.com/degueba/onda/commit/a01e46d285f9fe490d97d4f00445ccb67e0218d3))

## [0.4.1](https://github.com/degueba/onda/compare/ondajs-v0.4.0...ondajs-v0.4.1) (2026-05-25)


### Bug Fixes

* **cli:** ship canvas-schemas.ts alongside canvas.tsx in lib-canvas ([3b315a0](https://github.com/degueba/onda/commit/3b315a0)) — the schema-source-split refactor in #23 made every component schema import from `lib/canvas-schemas`, but the lib-canvas manifest only shipped `canvas.tsx`, leaving consumers with unresolved `@/lib/onda/canvas-schemas` imports after `bunx ondajs add <slug>`.

## [0.4.0](https://github.com/degueba/onda/compare/ondajs-v0.3.0...ondajs-v0.4.0) (2026-05-25)


### Features

* **cli:** runtime manifest export — `import { manifest } from 'ondajs'` ([#23](https://github.com/degueba/onda/issues/23)) ([0ce1ae5](https://github.com/degueba/onda/commit/0ce1ae58ae2f250e297e3215540780cb6141a104)), closes [#21](https://github.com/degueba/onda/issues/21)

## [0.3.0](https://github.com/degueba/onda/compare/ondajs-v0.2.0...ondajs-v0.3.0) (2026-05-24)


### Features

* canvas-aware components + media primitives + composition renderer ([#10](https://github.com/degueba/onda/issues/10)) ([3690e5d](https://github.com/degueba/onda/commit/3690e5d4602bccf39b853512783273a3bf134509))

## [0.2.0](https://github.com/degueba/onda/compare/ondajs-v0.1.0...ondajs-v0.2.0) (2026-05-24)


### Features

* **cli:** `onda add` happy path — techspec 006 M2 ([bd3e79c](https://github.com/degueba/onda/commit/bd3e79c59dd460f36c76a9efffda6cb0ec32787d))
* **cli:** scaffold `onda` package — techspec 006 M1 ([a3de5c5](https://github.com/degueba/onda/commit/a3de5c50a6d2b19149f458c4ada555dad7c165ce))
* **cli:** transitive deps + import rewriting — techspec 006 M3 + M4 ([3a24e26](https://github.com/degueba/onda/commit/3a24e2626b92c461796ae8c8932be4a659714bfd))
* ship `onda list` + site-served registry + Vercel deploy prep — techspec 006 M5 + M6 ([799691f](https://github.com/degueba/onda/commit/799691f79fbe3b0273d55fe261d1a1c78e27a3d8))
