# CodeBlock

Syntax-highlighted code on the Onda glass surface (`Surface` primitive), revealed line-by-line via the `useStaggeredEntrance` hook. Highlighting is a **deterministic, dependency-free tokenizer** that runs in render — no async, no Shiki at frame time — so frame N is always reproducible (§1). Keywords carry the one earned accent (`--onda-accent`); strings, comments, and numbers use restrained neutral steps.

This is the reference implementation for the `interface` category.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `code` | `string` | sample | Source; newlines become reveal-able lines. |
| `title` | `string` | `"onda.ts"` | Filename in the title bar. |
| `chrome` | `boolean` | `true` | macOS-style window chrome. |
| `revealLines` | `boolean` | `true` | Reveal lines one-by-one. |
| `delay` | `number` | `0` | Frames before the first line. |
| `lineDelay` | `number` | `3` | Frames between line reveals. |
| `fontFamily` | `string` | monospace stack | Code needs real monospace for alignment. |
| `fontSize` | `number` | `48` | Code font size (sized for video, not screen UI). |
| `width` | `number?` | auto | Surface width. |
| `textColor` / `keywordColor` / `stringColor` / `commentColor` / `numberColor` | `string` | token defaults | Tunable palette. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

> The default tokenizer is tuned for JS/TS. For other languages it falls back gracefully (keywords/strings/comments/numbers only).

## Usage

```tsx
import { CodeBlock } from './components/onda/code-block/CodeBlock';

export const CodeScene = () => (
  <CodeBlock
    code={`export const onda = motion('identity');\nawait onda.render();`}
    title="render.ts"
    placement="center"
  />
);
```
