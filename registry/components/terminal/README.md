# Terminal

A terminal session on the Onda glass surface: the command types itself out after the prompt (via `useTextReveal`), a block cursor blinks while typing (keyed off the frame, not a timer — so it stays deterministic), then the output lines appear staggered once typing finishes. The prompt glyph carries the one earned accent.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `command` | `string` | sample | The command that types itself. |
| `output` | `string[]` | sample | Lines that appear after typing. |
| `prompt` | `string` | `"$"` | Shell prompt glyph. |
| `title` | `string` | `"zsh"` | Title-bar label. |
| `chrome` | `boolean` | `true` | Window chrome. |
| `delay` | `number` | `0` | Frames before typing. |
| `typeSpeed` | `number` | `30` | Frames to type the command. |
| `outputDelay` | `number` | `8` | Frames before output begins. |
| `fontFamily` | `string` | monospace stack | — |
| `fontSize` | `number` | `48` | Sized for video, not screen UI. |
| `width` | `number` | `1100` | Fixed so the frame is stable while typing. |
| `textColor` / `promptColor` / `outputColor` | `string` | token defaults | — |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { Terminal } from './components/onda/terminal/Terminal';

export const InstallScene = () => (
  <Terminal command="npx ondajs add code-block" output={['✓ added code-block']} placement="center" />
);
```
