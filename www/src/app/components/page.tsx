import type { Metadata } from 'next';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
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
    blurb: 'Vector and path-based reveals — draw-on strokes, logo flourishes.',
  },
  {
    id: 'atmosphere',
    label: 'Atmosphere',
    blurb: 'Backgrounds and overlays — texture, grain, ticker tape, ambient layers.',
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    blurb: 'Camera-feel motion on images and scenes — slow pans, zooms, parallax. The motion of photography in code.',
  },
  {
    id: 'scenes',
    label: 'Scenes',
    blurb: 'Composite scene blocks — title cards, lower-thirds, stat cards. Composed from primitives, ready to drop into a video.',
  },
];

export default function ComponentsIndexPage() {
  const components = listComponents();

  // Group components by their meta.json `category` field, in the display
  // order above. Unknown categories collect into "Other" so a future
  // primitive doesn't disappear from the catalog if its category is missing.
  const grouped = CATEGORY_ORDER.map((cat) => ({
    ...cat,
    items: components.filter((c) => c.category === cat.id),
  })).filter((cat) => cat.items.length > 0);

  const knownIds = new Set(CATEGORY_ORDER.map((c) => c.id));
  const orphans = components.filter((c) => !knownIds.has(c.category));

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 w-full max-w-150 mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
            Catalog
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Components
          </h1>
          <p className="text-onda-dim mt-2 max-w-80">
            {components.length === 1
              ? 'One primitive shipping today. More coming.'
              : `${components.length} primitives, all built from the same motion language.`}
          </p>
        </header>

        <div className="flex flex-col gap-10 sm:gap-12">
          {grouped.map((cat) => (
            <section key={cat.id}>
              <div className="flex items-baseline justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
                    {cat.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-onda-faint mt-0.5 max-w-80">
                    {cat.blurb}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-onda-faint tabular-nums">
                  {cat.items.length} {cat.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.items.map((c) => (
                  <li key={c.name}>
                    <Link
                      href={`/components/${c.name}`}
                      className="block h-full bg-onda-surface border border-onda-border hover:border-onda-border-lit rounded-2xl p-3 transition-colors"
                    >
                      <h3 className="font-display text-xl font-semibold tracking-tight text-onda-text">
                        {c.title}
                      </h3>
                      <p className="text-sm text-onda-dim mt-1 line-clamp-3">
                        {c.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {c.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-wider text-onda-faint border border-onda-border rounded-md px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {orphans.length > 0 && (
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text mb-3">
                Other
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {orphans.map((c) => (
                  <li key={c.name}>
                    <Link
                      href={`/components/${c.name}`}
                      className="block h-full bg-onda-surface border border-onda-border hover:border-onda-border-lit rounded-2xl p-3 transition-colors"
                    >
                      <h3 className="font-display text-xl font-semibold tracking-tight text-onda-text">
                        {c.title}
                      </h3>
                      <p className="text-sm text-onda-dim mt-1 line-clamp-3">
                        {c.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
