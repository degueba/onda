import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ComponentsCatalog, type CatalogGroup } from '@/components/ComponentsCatalog';
import { listComponents } from '@/lib/registry';
import { SITE, absoluteUrl } from '@/lib/seo';

const PAGE_TITLE = 'Components';
const PAGE_DESCRIPTION =
  'Browse the Onda catalog — Remotion motion graphics components built from a single restrained motion language. Each primitive ships as source you own.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/components') },
  openGraph: {
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/components'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} — ${SITE.name}`,
    description: PAGE_DESCRIPTION,
  },
};

// Display order for the category sections. Anything not listed here lands in
// an "Other" bucket at the bottom — useful as a fallback while the catalog
// grows past the current four categories.
const CATEGORY_ORDER: Array<{ id: string; label: string; blurb: string }> = [
  {
    id: 'entrances',
    label: 'Entrances',
    blurb: 'Reveal patterns — fade, slide, scale, rotate, mask, blur, typewriter, word-stagger.',
  },
  {
    id: 'data',
    label: 'Data',
    blurb: 'Animated values — counters, percentages, progress.',
  },
  {
    id: 'graphics',
    label: 'Graphics',
    blurb: 'Emphasis and treatment on content — highlights, underlines, shimmer, rotating copy, draw-on strokes.',
  },
  {
    id: 'interface',
    label: 'Interface',
    blurb: 'Developer and product UI surfaces — code blocks, terminals, browser frames, steppers.',
  },
  {
    id: 'atmosphere',
    label: 'Atmosphere',
    blurb: 'Backgrounds and overlays — texture, grain, gradients, grids, ambient layers.',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    blurb: 'Camera-feel motion on images and scenes — slow pans, zooms, parallax. The motion of photography in code.',
  },
  {
    id: 'media',
    label: 'Media',
    blurb: 'Audio, video, and captions — media primitives that ride the same timeline.',
  },
  {
    id: 'scenes',
    label: 'Scenes',
    blurb: 'Composite scene blocks — title cards, lower-thirds, stat cards. Composed from primitives, ready to drop into a video.',
  },
];

export default function ComponentsIndexPage() {
  const components = listComponents();

  // Group by `category` in display order, trimming the heavy `readme` field
  // before handing data to the client island. Unknown categories collect into
  // an "Other" group so a future primitive never disappears from the catalog.
  const toCatalogItem = (c: (typeof components)[number]) => ({
    name: c.name,
    title: c.title,
    description: c.description,
    category: c.category,
    tags: c.tags,
  });

  const groups: CatalogGroup[] = CATEGORY_ORDER.map((cat) => ({
    id: cat.id,
    label: cat.label,
    blurb: cat.blurb,
    items: components.filter((c) => c.category === cat.id).map(toCatalogItem),
  })).filter((g) => g.items.length > 0);

  const knownIds = new Set(CATEGORY_ORDER.map((c) => c.id));
  const orphans = components.filter((c) => !knownIds.has(c.category));
  if (orphans.length > 0) {
    groups.push({
      id: 'other',
      label: 'Other',
      blurb: 'Uncategorized primitives.',
      items: orphans.map(toCatalogItem),
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 w-full max-w-240 mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
            Catalog
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Components
          </h1>
          <p className="text-onda-dim mt-3 max-w-xl leading-relaxed">
            {components.length === 1
              ? 'One primitive shipping today. More coming.'
              : `${components.length} primitives. One motion language. Source you own — copied into your project, never imported as a black box.`}
          </p>
        </header>

        <ComponentsCatalog groups={groups} total={components.length} />
      </main>

      <Footer />
    </div>
  );
}
