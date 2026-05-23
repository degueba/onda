'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import type { ZodTypeAny } from 'zod';
import { BlurReveal, blurRevealSchema } from '@onda/registry/components/blur-reveal/BlurReveal';
import { FadeIn, fadeInSchema } from '@onda/registry/components/fade-in/FadeIn';
import { SlideIn, slideInSchema } from '@onda/registry/components/slide-in/SlideIn';
import { ScaleIn, scaleInSchema } from '@onda/registry/components/scale-in/ScaleIn';
import { RotateIn, rotateInSchema } from '@onda/registry/components/rotate-in/RotateIn';
import { MaskReveal, maskRevealSchema } from '@onda/registry/components/mask-reveal/MaskReveal';
import { WordStagger, wordStaggerSchema } from '@onda/registry/components/word-stagger/WordStagger';
import { Typewriter, typewriterSchema } from '@onda/registry/components/typewriter/Typewriter';
import { CountUp, countUpSchema } from '@onda/registry/components/count-up/CountUp';
import { DrawOn, drawOnSchema } from '@onda/registry/components/draw-on/DrawOn';
import { GrainOverlay, grainOverlaySchema } from '@onda/registry/components/grain-overlay/GrainOverlay';
import { StaggerGroup, staggerGroupSchema } from '@onda/registry/components/stagger-group/StaggerGroup';
import { Marquee, marqueeSchema } from '@onda/registry/components/marquee/Marquee';
import { KenBurns, kenBurnsSchema } from '@onda/registry/components/ken-burns/KenBurns';
import { Callout, calloutSchema } from '@onda/registry/components/callout/Callout';
import { Underline, underlineSchema } from '@onda/registry/components/underline/Underline';
import { Captions, captionsSchema } from '@onda/registry/components/captions/Captions';
import { BarChart, barChartSchema } from '@onda/registry/components/bar-chart/BarChart';
import { LowerThird, lowerThirdSchema } from '@onda/registry/components/lower-third/LowerThird';
import { TitleCard, titleCardSchema } from '@onda/registry/components/title-card/TitleCard';
import { StatCard, statCardSchema } from '@onda/registry/components/stat-card/StatCard';
import { QuoteCard, quoteCardSchema } from '@onda/registry/components/quote-card/QuoteCard';
import { EndCard, endCardSchema } from '@onda/registry/components/end-card/EndCard';
import { LogoSting, logoStingSchema } from '@onda/registry/components/logo-sting/LogoSting';
import { CameraShake, cameraShakeSchema } from '@onda/registry/components/camera-shake/CameraShake';
import { GradientShift, gradientShiftSchema } from '@onda/registry/components/gradient-shift/GradientShift';
import { ComponentPreview } from './ComponentPreview';
import { TryItPopover } from './TryItPopover';

// Slug → live React component + Zod schema. Lives in a client-only module so
// the Player (which can't safely SSR-prerender) only ever runs in the browser.
//
// One entry per registered component. When the catalog grows past ~5, a
// codegen script (own techspec) can replace this hand-maintained map.
const REGISTRY: Record<
  string,
  { component: ComponentType<never>; schema: ZodTypeAny }
> = {
  'blur-reveal': {
    component: BlurReveal as unknown as ComponentType<never>,
    schema: blurRevealSchema,
  },
  'fade-in': {
    component: FadeIn as unknown as ComponentType<never>,
    schema: fadeInSchema,
  },
  'slide-in': {
    component: SlideIn as unknown as ComponentType<never>,
    schema: slideInSchema,
  },
  'scale-in': {
    component: ScaleIn as unknown as ComponentType<never>,
    schema: scaleInSchema,
  },
  'rotate-in': {
    component: RotateIn as unknown as ComponentType<never>,
    schema: rotateInSchema,
  },
  'mask-reveal': {
    component: MaskReveal as unknown as ComponentType<never>,
    schema: maskRevealSchema,
  },
  'word-stagger': {
    component: WordStagger as unknown as ComponentType<never>,
    schema: wordStaggerSchema,
  },
  'typewriter': {
    component: Typewriter as unknown as ComponentType<never>,
    schema: typewriterSchema,
  },
  'count-up': {
    component: CountUp as unknown as ComponentType<never>,
    schema: countUpSchema,
  },
  'draw-on': {
    component: DrawOn as unknown as ComponentType<never>,
    schema: drawOnSchema,
  },
  'grain-overlay': {
    component: GrainOverlay as unknown as ComponentType<never>,
    schema: grainOverlaySchema,
  },
  'stagger-group': {
    component: StaggerGroup as unknown as ComponentType<never>,
    schema: staggerGroupSchema,
  },
  'marquee': {
    component: Marquee as unknown as ComponentType<never>,
    schema: marqueeSchema,
  },
  'ken-burns': {
    component: KenBurns as unknown as ComponentType<never>,
    schema: kenBurnsSchema,
  },
  'callout': {
    component: Callout as unknown as ComponentType<never>,
    schema: calloutSchema,
  },
  'underline': {
    component: Underline as unknown as ComponentType<never>,
    schema: underlineSchema,
  },
  'captions': {
    component: Captions as unknown as ComponentType<never>,
    schema: captionsSchema,
  },
  'bar-chart': {
    component: BarChart as unknown as ComponentType<never>,
    schema: barChartSchema,
  },
  'lower-third': {
    component: LowerThird as unknown as ComponentType<never>,
    schema: lowerThirdSchema,
  },
  'title-card': {
    component: TitleCard as unknown as ComponentType<never>,
    schema: titleCardSchema,
  },
  'stat-card': {
    component: StatCard as unknown as ComponentType<never>,
    schema: statCardSchema,
  },
  'quote-card': {
    component: QuoteCard as unknown as ComponentType<never>,
    schema: quoteCardSchema,
  },
  'end-card': {
    component: EndCard as unknown as ComponentType<never>,
    schema: endCardSchema,
  },
  'logo-sting': {
    component: LogoSting as unknown as ComponentType<never>,
    schema: logoStingSchema,
  },
  'camera-shake': {
    component: CameraShake as unknown as ComponentType<never>,
    schema: cameraShakeSchema,
  },
  'gradient-shift': {
    component: GradientShift as unknown as ComponentType<never>,
    schema: gradientShiftSchema,
  },
};

type LivePreviewProps = {
  slug: string;
  propsOverride?: Record<string, unknown>;
  durationInFrames?: number;
  /** When true, render the interactive props panel below the player. */
  controls?: boolean;
};

export function LivePreview({
  slug,
  propsOverride,
  durationInFrames = 120,
  controls = false,
}: LivePreviewProps) {
  const entry = REGISTRY[slug];

  // Schema-derived defaults + any per-mount overrides. Memoized so the values
  // useState initializer sees a stable reference and the controls' Reset
  // button can return to a known good state.
  const defaults = useMemo(() => {
    if (!entry) return {} as Record<string, unknown>;
    const base = entry.schema.parse({}) as Record<string, unknown>;
    return { ...base, ...propsOverride };
  }, [entry, propsOverride]);

  const [values, setValues] = useState<Record<string, unknown>>(defaults);

  if (!entry) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]">
      <ComponentPreview
        component={entry.component}
        inputProps={values as never}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
      />
      {controls && (
        <TryItPopover
          schema={entry.schema}
          values={values}
          defaults={defaults}
          onChange={setValues}
        />
      )}
    </div>
  );
}
