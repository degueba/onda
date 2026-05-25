# ProgressSteps

A horizontal stepper whose fill animates to the `current` step on the house spring (`useSpringValue`). Completed dots and the connecting track carry the earned accent; the active dot gets a soft glow ring; pending steps stay neutral. Labels brighten as their step activates.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `steps` | `string[]` | `["Plan","Build","Render","Ship"]` | Step labels. |
| `current` | `number` | `2` | Completed count; fill animates here. |
| `delay` | `number` | `0` | Frames before the fill. |
| `duration` | `number` | `30` | Frames for the fill to travel. |
| `accentColor` | `string` | `#D96B82` | Completed / active color. |
| `dimColor` | `string` | `#26262E` | Pending color. |
| `labelColor` | `string` | `#8E8E98` | Label color. |
| `fontFamily` / `fontSize` | — | `34` | Label type (sized for video). |
| `width` | `number` | `1280` | Overall width. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

> Uses CSS `color-mix` to blend the dot color across activation. Supported in modern Chromium (Remotion's renderer).

## Usage

```tsx
import { ProgressSteps } from './components/onda/progress-steps/ProgressSteps';

export const OnboardingScene = () => (
  <ProgressSteps steps={['Plan', 'Build', 'Ship']} current={2} placement="center" />
);
```
