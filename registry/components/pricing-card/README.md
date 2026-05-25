# PricingCard

A single pricing tier on the Onda glass `Surface` — tier name, a large `price` in the display font, a billing `period`, an accent-checkmark feature list, and a CTA button. The card rises in on the house spring. Set `recommended` to lift and scale the card slightly, swap the CTA to a filled accent button, add a pill badge, and float a soft accent glow behind it — the highlighted tier in a three-up row. This is one card; arrange three side by side for a pricing table.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tier` | `string` | `"Pro"` | Tier name above the price. |
| `price` | `string` | `"$29"` | Large headline price (free-form, e.g. `"Free"`, `"€19"`). |
| `period` | `string` | `"/month"` | Billing period; empty hides it. |
| `features` | `string[]` | sample list | Feature checklist with accent checkmarks. |
| `cta` | `string` | `"Get started"` | CTA button label. |
| `recommended` | `boolean` | `false` | Lifts + scales the card, fills the CTA, shows a badge + glow. |
| `accent` | `string` | `#D96B82` | Earned accent — checkmarks, badge, CTA, glow. |
| `delay` | `number` | `0` | Frames before entrance. |
| `width` | `number` | `380` | Card width. |
| `size` | size role | — | Semantic size for the price; overrides the px default. |
| `fontFamily` | `string` | Clash Display | Price display font. |
| `placement` | region or `{x,y,anchor}` | — | Canvas placement. |

## Usage

```tsx
import { PricingCard } from './components/onda/pricing-card/PricingCard';

export const PricingScene = () => (
  <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
    <PricingCard tier="Starter" price="$0" period="/month" cta="Start free" delay={0} />
    <PricingCard tier="Pro" price="$29" period="/month" recommended delay={4} />
    <PricingCard tier="Team" price="$99" period="/month" cta="Contact sales" delay={8} />
  </AbsoluteFill>
);
```
