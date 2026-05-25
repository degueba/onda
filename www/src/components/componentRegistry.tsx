'use client';

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
import { WordRotate, wordRotateSchema } from '@onda/registry/components/word-rotate/WordRotate';
import { Spotlight, spotlightSchema } from '@onda/registry/components/spotlight/Spotlight';
import { Highlight, highlightSchema } from '@onda/registry/components/highlight/Highlight';
import { PieReveal, pieRevealSchema } from '@onda/registry/components/pie-reveal/PieReveal';
import { ProgressBar, progressBarSchema } from '@onda/registry/components/progress-bar/ProgressBar';
import { Timeline, timelineSchema } from '@onda/registry/components/timeline/Timeline';
import { IconPop, iconPopSchema } from '@onda/registry/components/icon-pop/IconPop';
import { FadeOut, fadeOutSchema } from '@onda/registry/components/fade-out/FadeOut';
import { SlideOut, slideOutSchema } from '@onda/registry/components/slide-out/SlideOut';
import { Parallax, parallaxSchema } from '@onda/registry/components/parallax/Parallax';
import { Vignette, vignetteSchema } from '@onda/registry/components/vignette/Vignette';
import { ChapterCard, chapterCardSchema } from '@onda/registry/components/chapter-card/ChapterCard';
import { ImageReveal, imageRevealSchema } from '@onda/registry/components/image-reveal/ImageReveal';
import { VideoClip, videoClipSchema } from '@onda/registry/components/video-clip/VideoClip';
import { AudioClip, audioClipSchema } from '@onda/registry/components/audio-clip/AudioClip';
import { AudioVisualizer, audioVisualizerSchema, audioVisualizerPresets, type AudioVisualizerProps } from '@onda/registry/components/audio-visualizer/AudioVisualizer';
import { ShimmerSweep, shimmerSweepSchema } from '@onda/registry/components/shimmer-sweep/ShimmerSweep';
import { TrackingIn, trackingInSchema } from '@onda/registry/components/tracking-in/TrackingIn';
import { TextFadeReplace, textFadeReplaceSchema } from '@onda/registry/components/text-fade-replace/TextFadeReplace';
import { CodeBlock, codeBlockSchema } from '@onda/registry/components/code-block/CodeBlock';
import { Terminal, terminalSchema } from '@onda/registry/components/terminal/Terminal';
import { BrowserFrame, browserFrameSchema } from '@onda/registry/components/browser-frame/BrowserFrame';
import { ProgressSteps, progressStepsSchema } from '@onda/registry/components/progress-steps/ProgressSteps';
import { MeshGradient, meshGradientSchema } from '@onda/registry/components/mesh-gradient/MeshGradient';
import { DynamicGrid, dynamicGridSchema } from '@onda/registry/components/dynamic-grid/DynamicGrid';
import { SpotlightCard, spotlightCardSchema } from '@onda/registry/components/spotlight-card/SpotlightCard';
import { Cursor, cursorSchema } from '@onda/registry/components/cursor/Cursor';
import { CodeDiff, codeDiffSchema } from '@onda/registry/components/code-diff/CodeDiff';
import { DeviceFrame, deviceFrameSchema } from '@onda/registry/components/device-frame/DeviceFrame';
import { LineChart, lineChartSchema } from '@onda/registry/components/line-chart/LineChart';
import { PulsingIndicator, pulsingIndicatorSchema } from '@onda/registry/components/pulsing-indicator/PulsingIndicator';
import { MatrixDecode, matrixDecodeSchema } from '@onda/registry/components/matrix-decode/MatrixDecode';
import { RgbGlitchText, rgbGlitchTextSchema } from '@onda/registry/components/rgb-glitch-text/RgbGlitchText';
import { SlotMachineRoll, slotMachineRollSchema } from '@onda/registry/components/slot-machine-roll/SlotMachineRoll';
import { Confetti, confettiSchema } from '@onda/registry/components/confetti/Confetti';
import { BentoGrid, bentoGridSchema } from '@onda/registry/components/bento-grid/BentoGrid';
import { NodeGraph, nodeGraphSchema } from '@onda/registry/components/node-graph/NodeGraph';
import { KanbanBoard, kanbanBoardSchema } from '@onda/registry/components/kanban-board/KanbanBoard';
import { SplitScreen, splitScreenSchema } from '@onda/registry/components/split-screen/SplitScreen';
import { PricingCard, pricingCardSchema } from '@onda/registry/components/pricing-card/PricingCard';
import { InputField, inputFieldSchema } from '@onda/registry/components/input-field/InputField';
import { SkeletonCard, skeletonCardSchema } from '@onda/registry/components/skeleton-card/SkeletonCard';
import { Button, buttonSchema } from '@onda/registry/components/button/Button';
import { BoundingBox, boundingBoxSchema } from '@onda/registry/components/bounding-box/BoundingBox';

// Composite preview for `audio-visualizer` — by design the component
// itself does NOT play audio (see techspec 011), so a bare preview shows
// bars dancing to silence and reads as broken. We pair it with a parallel
// AudioClip pointing at the same `src` so the user hears + sees the same
// stream.
function AudioVisualizerWithPlayback(props: AudioVisualizerProps) {
  const clipProps = audioClipSchema.parse({ src: props.src, volume: 0.6 });
  return (
    <>
      <AudioClip {...clipProps} />
      <AudioVisualizer {...props} />
    </>
  );
}

export type ComponentRegistryEntry = {
  component: ComponentType<never>;
  schema: ZodTypeAny;
  /** Per-slug override for the schema's default props. Mostly used by
   *  audio/video components where the schema's default `src` points at a
   *  remote URL that fails CORS in the browser — we serve self-hosted
   *  CC0 media under /www/public instead. */
  defaultPropsOverride?: Record<string, unknown>;
  /** Named visual personalities a component exports. Rendered as a
   *  preset chip row in the TryIt popover. */
  presets?: Record<string, Record<string, unknown>>;
};

// Slug → live React component + Zod schema. Shared between the detail-page
// LivePreview and the /components catalog tile so there's one source of
// truth. Client-only because <Player /> can't safely SSR-prerender.
export const COMPONENT_REGISTRY: Record<string, ComponentRegistryEntry> = {
  'blur-reveal': { component: BlurReveal as unknown as ComponentType<never>, schema: blurRevealSchema },
  'fade-in': { component: FadeIn as unknown as ComponentType<never>, schema: fadeInSchema },
  'slide-in': { component: SlideIn as unknown as ComponentType<never>, schema: slideInSchema },
  'scale-in': { component: ScaleIn as unknown as ComponentType<never>, schema: scaleInSchema },
  'rotate-in': { component: RotateIn as unknown as ComponentType<never>, schema: rotateInSchema },
  'mask-reveal': { component: MaskReveal as unknown as ComponentType<never>, schema: maskRevealSchema },
  'word-stagger': { component: WordStagger as unknown as ComponentType<never>, schema: wordStaggerSchema },
  'typewriter': { component: Typewriter as unknown as ComponentType<never>, schema: typewriterSchema },
  'count-up': { component: CountUp as unknown as ComponentType<never>, schema: countUpSchema },
  'draw-on': { component: DrawOn as unknown as ComponentType<never>, schema: drawOnSchema },
  'grain-overlay': { component: GrainOverlay as unknown as ComponentType<never>, schema: grainOverlaySchema },
  'stagger-group': { component: StaggerGroup as unknown as ComponentType<never>, schema: staggerGroupSchema },
  'marquee': { component: Marquee as unknown as ComponentType<never>, schema: marqueeSchema },
  'ken-burns': { component: KenBurns as unknown as ComponentType<never>, schema: kenBurnsSchema },
  'callout': { component: Callout as unknown as ComponentType<never>, schema: calloutSchema },
  'underline': { component: Underline as unknown as ComponentType<never>, schema: underlineSchema },
  'captions': { component: Captions as unknown as ComponentType<never>, schema: captionsSchema },
  'bar-chart': { component: BarChart as unknown as ComponentType<never>, schema: barChartSchema },
  'lower-third': { component: LowerThird as unknown as ComponentType<never>, schema: lowerThirdSchema },
  'title-card': { component: TitleCard as unknown as ComponentType<never>, schema: titleCardSchema },
  'stat-card': { component: StatCard as unknown as ComponentType<never>, schema: statCardSchema },
  'quote-card': { component: QuoteCard as unknown as ComponentType<never>, schema: quoteCardSchema },
  'end-card': { component: EndCard as unknown as ComponentType<never>, schema: endCardSchema },
  'logo-sting': { component: LogoSting as unknown as ComponentType<never>, schema: logoStingSchema },
  'camera-shake': { component: CameraShake as unknown as ComponentType<never>, schema: cameraShakeSchema },
  'gradient-shift': { component: GradientShift as unknown as ComponentType<never>, schema: gradientShiftSchema },
  'word-rotate': { component: WordRotate as unknown as ComponentType<never>, schema: wordRotateSchema },
  'spotlight': { component: Spotlight as unknown as ComponentType<never>, schema: spotlightSchema },
  'highlight': { component: Highlight as unknown as ComponentType<never>, schema: highlightSchema },
  'pie-reveal': { component: PieReveal as unknown as ComponentType<never>, schema: pieRevealSchema },
  'progress-bar': { component: ProgressBar as unknown as ComponentType<never>, schema: progressBarSchema },
  'timeline': { component: Timeline as unknown as ComponentType<never>, schema: timelineSchema },
  'icon-pop': { component: IconPop as unknown as ComponentType<never>, schema: iconPopSchema },
  'fade-out': { component: FadeOut as unknown as ComponentType<never>, schema: fadeOutSchema },
  'slide-out': { component: SlideOut as unknown as ComponentType<never>, schema: slideOutSchema },
  'parallax': { component: Parallax as unknown as ComponentType<never>, schema: parallaxSchema },
  'vignette': { component: Vignette as unknown as ComponentType<never>, schema: vignetteSchema },
  'chapter-card': { component: ChapterCard as unknown as ComponentType<never>, schema: chapterCardSchema },
  'image-reveal': { component: ImageReveal as unknown as ComponentType<never>, schema: imageRevealSchema },
  'video-clip': { component: VideoClip as unknown as ComponentType<never>, schema: videoClipSchema },
  'audio-clip': {
    component: AudioClip as unknown as ComponentType<never>,
    schema: audioClipSchema,
    defaultPropsOverride: { src: '/music.mp3' },
  },
  'audio-visualizer': {
    component: AudioVisualizerWithPlayback as unknown as ComponentType<never>,
    schema: audioVisualizerSchema,
    defaultPropsOverride: { src: '/music.mp3' },
    presets: audioVisualizerPresets as unknown as Record<string, Record<string, unknown>>,
  },
  'shimmer-sweep': { component: ShimmerSweep as unknown as ComponentType<never>, schema: shimmerSweepSchema },
  'tracking-in': { component: TrackingIn as unknown as ComponentType<never>, schema: trackingInSchema },
  'text-fade-replace': { component: TextFadeReplace as unknown as ComponentType<never>, schema: textFadeReplaceSchema },
  'code-block': { component: CodeBlock as unknown as ComponentType<never>, schema: codeBlockSchema },
  'terminal': { component: Terminal as unknown as ComponentType<never>, schema: terminalSchema },
  'browser-frame': { component: BrowserFrame as unknown as ComponentType<never>, schema: browserFrameSchema },
  'progress-steps': { component: ProgressSteps as unknown as ComponentType<never>, schema: progressStepsSchema },
  'mesh-gradient': { component: MeshGradient as unknown as ComponentType<never>, schema: meshGradientSchema },
  'dynamic-grid': { component: DynamicGrid as unknown as ComponentType<never>, schema: dynamicGridSchema },
  'spotlight-card': { component: SpotlightCard as unknown as ComponentType<never>, schema: spotlightCardSchema },
  'cursor': { component: Cursor as unknown as ComponentType<never>, schema: cursorSchema },
  'code-diff': { component: CodeDiff as unknown as ComponentType<never>, schema: codeDiffSchema },
  'device-frame': { component: DeviceFrame as unknown as ComponentType<never>, schema: deviceFrameSchema },
  'line-chart': { component: LineChart as unknown as ComponentType<never>, schema: lineChartSchema },
  'pulsing-indicator': { component: PulsingIndicator as unknown as ComponentType<never>, schema: pulsingIndicatorSchema },
  'matrix-decode': { component: MatrixDecode as unknown as ComponentType<never>, schema: matrixDecodeSchema },
  'rgb-glitch-text': { component: RgbGlitchText as unknown as ComponentType<never>, schema: rgbGlitchTextSchema },
  'slot-machine-roll': { component: SlotMachineRoll as unknown as ComponentType<never>, schema: slotMachineRollSchema },
  'confetti': { component: Confetti as unknown as ComponentType<never>, schema: confettiSchema },
  'bento-grid': { component: BentoGrid as unknown as ComponentType<never>, schema: bentoGridSchema },
  'node-graph': { component: NodeGraph as unknown as ComponentType<never>, schema: nodeGraphSchema },
  'kanban-board': { component: KanbanBoard as unknown as ComponentType<never>, schema: kanbanBoardSchema },
  'split-screen': { component: SplitScreen as unknown as ComponentType<never>, schema: splitScreenSchema },
  'pricing-card': { component: PricingCard as unknown as ComponentType<never>, schema: pricingCardSchema },
  'input-field': { component: InputField as unknown as ComponentType<never>, schema: inputFieldSchema },
  'skeleton-card': { component: SkeletonCard as unknown as ComponentType<never>, schema: skeletonCardSchema },
  'button': { component: Button as unknown as ComponentType<never>, schema: buttonSchema },
  'bounding-box': { component: BoundingBox as unknown as ComponentType<never>, schema: boundingBoxSchema },
};
