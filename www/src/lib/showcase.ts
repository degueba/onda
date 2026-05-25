// Central registry of showcase compositions — pre-built end-to-end
// examples that show Onda assembling 10+ components into a complete
// short. Each showcase is a real `<Composition>` body the user can
// fork; the index here is the source of truth the gallery (/showcase)
// and detail page (/showcase/[slug]) read from.
//
// Adding a new showcase: drop a folder under `www/src/showcase/<slug>/`
// with `meta.ts` + `composition.tsx`, then append a `SHOWCASES` entry
// here. Entries are intentionally hand-maintained (not auto-glob) so
// the order in the gallery is deliberate.

import type { ComponentType } from 'react';
import { explainer30sMeta } from '@/showcase/explainer-30s/meta';
import { podcastIntroMeta } from '@/showcase/podcast-intro/meta';
import { socialAdVerticalMeta } from '@/showcase/social-ad-vertical/meta';
import { musicReleaseMeta } from '@/showcase/music-release/meta';
import { synthwavePromoMeta } from '@/showcase/synthwave-promo/meta';
import { meditationBreathMeta } from '@/showcase/meditation-breath/meta';
import { liveStreamOverlayMeta } from '@/showcase/live-stream-overlay/meta';
import { dataDashboardMeta } from '@/showcase/data-dashboard/meta';
import { tutorialIntroMeta } from '@/showcase/tutorial-intro/meta';
import { courseCompleteMeta } from '@/showcase/course-complete/meta';
import { launchCountdownMeta } from '@/showcase/launch-countdown/meta';
import { saveTheDateMeta } from '@/showcase/save-the-date/meta';
import { kpiSnapshotMeta } from '@/showcase/kpi-snapshot/meta';

/** Top-level grouping. Drives the section split in the gallery. */
export type ShowcaseCategory =
  | 'marketing'
  | 'media'
  | 'reports'
  | 'education'
  | 'events';

/** Display label + one-line description per category, in display order. */
export const SHOWCASE_CATEGORIES: ReadonlyArray<{
  key: ShowcaseCategory;
  label: string;
  blurb: string;
}> = [
  {
    key: 'marketing',
    label: 'Marketing & promo',
    blurb: 'Explainers, social ads, release cards — moves that sell something.',
  },
  {
    key: 'media',
    label: 'Media & broadcast',
    blurb: 'Podcasts, live overlays, ambient — content that hosts something.',
  },
  {
    key: 'education',
    label: 'Education & learning',
    blurb: 'Course intros, tutorial outros, slide reveals — content that teaches something.',
  },
  {
    key: 'events',
    label: 'Events & countdowns',
    blurb: 'Launch timers, sale endings, conference promos — moments that need a date.',
  },
  {
    key: 'reports',
    label: 'Reports & data',
    blurb: 'Dashboards, quarterly numbers — moves that show numbers.',
  },
];

/** Static shape of a showcase entry. Used by the gallery + detail pages. */
export type ShowcaseMeta = {
  slug: string;
  title: string;
  description: string;
  duration: number; // seconds
  fps: number;
  width: number;
  height: number;
  categoriesUsed: readonly string[];
  /** Top-level grouping for the gallery. */
  category: ShowcaseCategory;
  /** True if the composition has an audio track. Drives the AudioBadge
   *  pill on the preview card so visitors know it'll make sound. */
  hasAudio?: boolean;
};

/** All showcase metas in display order. The detail page resolves the
 *  composition component lazily via `loadShowcaseComponent` so this
 *  index can be imported in RSC paths (page metadata, gallery cards)
 *  without pulling Remotion into the server bundle. */
export const SHOWCASES: readonly ShowcaseMeta[] = [
  explainer30sMeta,
  podcastIntroMeta,
  musicReleaseMeta,
  synthwavePromoMeta,
  meditationBreathMeta,
  liveStreamOverlayMeta,
  socialAdVerticalMeta,
  dataDashboardMeta,
  kpiSnapshotMeta,
  tutorialIntroMeta,
  courseCompleteMeta,
  launchCountdownMeta,
  saveTheDateMeta,
] as const;

export const SHOWCASE_SLUGS = SHOWCASES.map((s) => s.slug);

export function getShowcase(slug: string): ShowcaseMeta | undefined {
  return SHOWCASES.find((s) => s.slug === slug);
}

/** Bucket the registered showcases by category, preserving the order
 *  defined in {@link SHOWCASE_CATEGORIES} and the per-category insertion
 *  order from {@link SHOWCASES}. Categories with no showcases are dropped. */
export function showcasesByCategory(): ReadonlyArray<{
  key: ShowcaseCategory;
  label: string;
  blurb: string;
  items: ShowcaseMeta[];
}> {
  return SHOWCASE_CATEGORIES.map((c) => ({
    ...c,
    items: SHOWCASES.filter((s) => s.category === c.key),
  })).filter((c) => c.items.length > 0);
}

/**
 * Lazy-load the showcase's React Component. Kept separate from the
 * meta index so the gallery cards (which don't render the actual
 * compositions inline) don't pull in Remotion. The detail page calls
 * this on the client side only.
 */
export async function loadShowcaseComponent(
  slug: string,
): Promise<ComponentType<Record<string, never>> | null> {
  switch (slug) {
    case 'explainer-30s':
      return (await import('@/showcase/explainer-30s/composition'))
        .ExplainerComposition;
    case 'podcast-intro':
      return (await import('@/showcase/podcast-intro/composition'))
        .PodcastIntroComposition;
    case 'music-release':
      return (await import('@/showcase/music-release/composition'))
        .MusicReleaseComposition;
    case 'synthwave-promo':
      return (await import('@/showcase/synthwave-promo/composition'))
        .SynthwavePromoComposition;
    case 'meditation-breath':
      return (await import('@/showcase/meditation-breath/composition'))
        .MeditationBreathComposition;
    case 'live-stream-overlay':
      return (await import('@/showcase/live-stream-overlay/composition'))
        .LiveStreamOverlayComposition;
    case 'social-ad-vertical':
      return (await import('@/showcase/social-ad-vertical/composition'))
        .SocialAdVerticalComposition;
    case 'data-dashboard':
      return (await import('@/showcase/data-dashboard/composition'))
        .DataDashboardComposition;
    case 'tutorial-intro':
      return (await import('@/showcase/tutorial-intro/composition'))
        .TutorialIntroComposition;
    case 'course-complete':
      return (await import('@/showcase/course-complete/composition'))
        .CourseCompleteComposition;
    case 'launch-countdown':
      return (await import('@/showcase/launch-countdown/composition'))
        .LaunchCountdownComposition;
    case 'save-the-date':
      return (await import('@/showcase/save-the-date/composition'))
        .SaveTheDateComposition;
    case 'kpi-snapshot':
      return (await import('@/showcase/kpi-snapshot/composition'))
        .KpiSnapshotComposition;
    default:
      return null;
  }
}
