# CodeDiff

A unified code diff on the Onda glass surface (`Surface`), revealed line-by-line via `useStaggeredEntrance`. Added / removed lines carry a colored left border + gutter symbol (`+` / `−`) and a faint tint; context lines stay neutral. Diff green/red is the one deliberate departure from the monochrome-plus-rose palette — semantic and universal — and both colors are props.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `lines` | `{text, type}[]` | sample | `type` ∈ `add` \| `remove` \| `context`. |
| `title` | `string` | `"motion.ts"` | Title-bar filename. |
| `chrome` | `boolean` | `true` | Window chrome. |
| `revealLines` | `boolean` | `true` | Reveal lines one-by-one. |
| `delay` | `number` | `0` | Frames before the first line. |
| `lineDelay` | `number` | `4` | Frames between line reveals. |
| `fontFamily` | `string` | monospace stack | — |
| `fontSize` | `number` | `44` | — |
| `width` | `number?` | auto | — |
| `textColor` / `addColor` / `removeColor` | `string` | token + diff colors | Tunable palette. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { CodeDiff } from './components/onda/code-diff/CodeDiff';

export const ChangeScene = () => (
  <CodeDiff
    title="motion.ts"
    lines={[
      { text: "motion('default');", type: 'remove' },
      { text: "motion('identity');", type: 'add' },
    ]}
    placement="center"
  />
);
```
