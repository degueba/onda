# InputField

A UI text input field on the Onda glass surface: a rounded glass field with an optional uppercase label above and a placeholder. With `typed` on, the `value` types itself in character by character (via `useTextReveal`) behind a blinking accent caret, and an accent focus ring lights the border once typing begins. The caret blink and focus ring are keyed off the frame (not a timer), so the field is fully deterministic. The caret and ring carry the one earned accent.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | sample email | The field's value; what types in when `typed`. |
| `placeholder` | `string` | sample | Shown while the field is empty. |
| `label` | `string` | `"Email"` | Label above the field. Empty hides it. |
| `typed` | `boolean` | `true` | Animate the value typing itself in. |
| `delay` | `number` | `0` | Frames before typing starts. |
| `typeDuration` | `number` | `36` | Frames to type the whole value. |
| `focusRing` | `boolean` | `true` | Accent focus ring around the field. |
| `width` | `number` | `640` | Field width in px (sized for video). |
| `fontSize` | `number` | `36` | Text size in px. Wins over `size`. |
| `size` | size role | — | Semantic role resolved to canvas-aware px. |
| `fontFamily` | `string` | Space Grotesk | UI font stack. |
| `textColor` / `placeholderColor` / `labelColor` / `accentColor` | `string` | token defaults | — |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { InputField } from './components/onda/input-field/InputField';

export const SignupScene = () => (
  <InputField label="Email" value="hello@onda.video" typed placement="center" />
);
```
