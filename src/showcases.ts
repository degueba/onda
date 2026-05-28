// Static registry of every showcase composition for Remotion's render
// surface. Mirrors the slug → component map in
// `www/src/lib/showcase.ts:loadShowcaseComponent` but with eager imports
// — Remotion's `<Composition>` needs the component at registration time,
// it can't await a dynamic import.
//
// To add a new showcase: drop a folder under `www/src/showcase/<slug>/`
// (which the website's gallery already auto-picks-up), then add one
// import pair + one row to the array below.
//
// The website's gallery uses dynamic imports because the gallery page
// renders cards (meta only) without ever loading the compositions; only
// the detail page lazily resolves the one composition being previewed.
// That ergonomic doesn't apply here — `remotion render` and `remotion
// studio` need every composition pre-discovered.

import type { ComponentType } from 'react';

import { ExplainerComposition } from '@onda/showcase/explainer-30s/composition';
import { explainer30sMeta } from '@onda/showcase/explainer-30s/meta';
import { PodcastIntroComposition } from '@onda/showcase/podcast-intro/composition';
import { podcastIntroMeta } from '@onda/showcase/podcast-intro/meta';
import { MusicReleaseComposition } from '@onda/showcase/music-release/composition';
import { musicReleaseMeta } from '@onda/showcase/music-release/meta';
import { SynthwavePromoComposition } from '@onda/showcase/synthwave-promo/composition';
import { synthwavePromoMeta } from '@onda/showcase/synthwave-promo/meta';
import { MeditationBreathComposition } from '@onda/showcase/meditation-breath/composition';
import { meditationBreathMeta } from '@onda/showcase/meditation-breath/meta';
import { LiveStreamOverlayComposition } from '@onda/showcase/live-stream-overlay/composition';
import { liveStreamOverlayMeta } from '@onda/showcase/live-stream-overlay/meta';
import { SocialAdVerticalComposition } from '@onda/showcase/social-ad-vertical/composition';
import { socialAdVerticalMeta } from '@onda/showcase/social-ad-vertical/meta';
import { DataDashboardComposition } from '@onda/showcase/data-dashboard/composition';
import { dataDashboardMeta } from '@onda/showcase/data-dashboard/meta';
import { KpiSnapshotComposition } from '@onda/showcase/kpi-snapshot/composition';
import { kpiSnapshotMeta } from '@onda/showcase/kpi-snapshot/meta';
import { TutorialIntroComposition } from '@onda/showcase/tutorial-intro/composition';
import { tutorialIntroMeta } from '@onda/showcase/tutorial-intro/meta';
import { CourseCompleteComposition } from '@onda/showcase/course-complete/composition';
import { courseCompleteMeta } from '@onda/showcase/course-complete/meta';
import { LaunchCountdownComposition } from '@onda/showcase/launch-countdown/composition';
import { launchCountdownMeta } from '@onda/showcase/launch-countdown/meta';
import { SaveTheDateComposition } from '@onda/showcase/save-the-date/composition';
import { saveTheDateMeta } from '@onda/showcase/save-the-date/meta';
import { DevDemoComposition } from '@onda/showcase/dev-demo/composition';
import { devDemoMeta } from '@onda/showcase/dev-demo/meta';
import { ChangelogComposition } from '@onda/showcase/changelog/composition';
import { changelogMeta } from '@onda/showcase/changelog/meta';
import { ProductLaunchComposition } from '@onda/showcase/product-launch/composition';
import { productLaunchMeta } from '@onda/showcase/product-launch/meta';
import { LiveMetricsComposition } from '@onda/showcase/live-metrics/composition';
import { liveMetricsMeta } from '@onda/showcase/live-metrics/meta';
import { ChangelogLoopComposition } from '@onda/showcase/changelog-loop/composition';
import { changelogLoopMeta } from '@onda/showcase/changelog-loop/meta';
import { DeployRevealComposition } from '@onda/showcase/deploy-reveal/composition';
import { deployRevealMeta } from '@onda/showcase/deploy-reveal/meta';
import { AnnotatedClickComposition } from '@onda/showcase/annotated-click/composition';
import { annotatedClickMeta } from '@onda/showcase/annotated-click/meta';
import { BrowserWalkthroughComposition } from '@onda/showcase/browser-walkthrough/composition';
import { browserWalkthroughMeta } from '@onda/showcase/browser-walkthrough/meta';
import { BentoDriftComposition } from '@onda/showcase/bento-drift/composition';
import { bentoDriftMeta } from '@onda/showcase/bento-drift/meta';
import { DeviceAssembleComposition } from '@onda/showcase/device-assemble/composition';
import { deviceAssembleMeta } from '@onda/showcase/device-assemble/meta';
import { LaunchTrailerComposition } from '@onda/showcase/launch-trailer/composition';
import { launchTrailerMeta } from '@onda/showcase/launch-trailer/meta';
import { IntegrationOrbitComposition } from '@onda/showcase/integration-orbit/composition';
import { integrationOrbitMeta } from '@onda/showcase/integration-orbit/meta';
import { BoardFlowComposition } from '@onda/showcase/board-flow/composition';
import { boardFlowMeta } from '@onda/showcase/board-flow/meta';
import { DashboardFillComposition } from '@onda/showcase/dashboard-fill/composition';
import { dashboardFillMeta } from '@onda/showcase/dashboard-fill/meta';
import { PromptToDashboardComposition } from '@onda/showcase/prompt-to-dashboard/composition';
import { promptToDashboardMeta } from '@onda/showcase/prompt-to-dashboard/meta';
import { PricingFocusComposition } from '@onda/showcase/pricing-focus/composition';
import { pricingFocusMeta } from '@onda/showcase/pricing-focus/meta';
import { CodeToPreviewComposition } from '@onda/showcase/code-to-preview/composition';
import { codeToPreviewMeta } from '@onda/showcase/code-to-preview/meta';
import { KineticTypeComposition } from '@onda/showcase/kinetic-type/composition';
import { kineticTypeMeta } from '@onda/showcase/kinetic-type/meta';

/** A registered showcase: the meta (drives dimensions / duration) + the
 *  component Remotion mounts. */
export type RegisteredShowcase = {
  meta: {
    slug: string;
    /** Seconds — converted to frames at registration time. */
    duration: number;
    fps: number;
    width: number;
    height: number;
  };
  Component: ComponentType<Record<string, never>>;
};

export const showcases: ReadonlyArray<RegisteredShowcase> = [
  { meta: explainer30sMeta, Component: ExplainerComposition },
  { meta: podcastIntroMeta, Component: PodcastIntroComposition },
  { meta: musicReleaseMeta, Component: MusicReleaseComposition },
  { meta: synthwavePromoMeta, Component: SynthwavePromoComposition },
  { meta: meditationBreathMeta, Component: MeditationBreathComposition },
  { meta: liveStreamOverlayMeta, Component: LiveStreamOverlayComposition },
  { meta: socialAdVerticalMeta, Component: SocialAdVerticalComposition },
  { meta: dataDashboardMeta, Component: DataDashboardComposition },
  { meta: kpiSnapshotMeta, Component: KpiSnapshotComposition },
  { meta: tutorialIntroMeta, Component: TutorialIntroComposition },
  { meta: courseCompleteMeta, Component: CourseCompleteComposition },
  { meta: launchCountdownMeta, Component: LaunchCountdownComposition },
  { meta: saveTheDateMeta, Component: SaveTheDateComposition },
  { meta: devDemoMeta, Component: DevDemoComposition },
  { meta: changelogMeta, Component: ChangelogComposition },
  { meta: productLaunchMeta, Component: ProductLaunchComposition },
  { meta: liveMetricsMeta, Component: LiveMetricsComposition },
  { meta: changelogLoopMeta, Component: ChangelogLoopComposition },
  { meta: deployRevealMeta, Component: DeployRevealComposition },
  { meta: annotatedClickMeta, Component: AnnotatedClickComposition },
  { meta: browserWalkthroughMeta, Component: BrowserWalkthroughComposition },
  { meta: bentoDriftMeta, Component: BentoDriftComposition },
  { meta: deviceAssembleMeta, Component: DeviceAssembleComposition },
  { meta: launchTrailerMeta, Component: LaunchTrailerComposition },
  { meta: integrationOrbitMeta, Component: IntegrationOrbitComposition },
  { meta: boardFlowMeta, Component: BoardFlowComposition },
  { meta: dashboardFillMeta, Component: DashboardFillComposition },
  { meta: promptToDashboardMeta, Component: PromptToDashboardComposition },
  { meta: pricingFocusMeta, Component: PricingFocusComposition },
  { meta: codeToPreviewMeta, Component: CodeToPreviewComposition },
  { meta: kineticTypeMeta, Component: KineticTypeComposition },
];
