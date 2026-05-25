# Changelog

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
