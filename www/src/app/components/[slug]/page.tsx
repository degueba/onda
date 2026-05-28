import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeShiki from '@shikijs/rehype';
import type { Pluggable } from 'unified';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CopyButton } from '@/components/CopyButton';
import { CodeBlock } from '@/components/CodeBlock';
import { LivePreviewSection } from '@/components/LivePreviewSection';
import { getComponent, listComponentSlugs } from '@/lib/registry';
import { ondaShikiTheme } from '@/lib/onda-shiki-theme';
import { SITE, absoluteUrl } from '@/lib/seo';

// Custom MDX element mapping. We override <pre> so every Shiki-highlighted
// code block gets a top-right copy affordance. Everything else falls
// through to the prose-onda CSS styles.
const mdxComponents = {
  pre: CodeBlock,
};

// MDX pipeline:
//   remark-gfm     — enables GitHub-flavored markdown (tables, strikethrough,
//                    task lists). Without this, the prop tables in component
//                    READMEs render as raw pipe-soup paragraphs.
//   @shikijs/rehype — syntax-highlights fenced code blocks using the custom
//                    onda-dark theme. The theme keeps rose as a deliberate
//                    anchor color (keywords, JSX tags) on a neutral canvas.
const rehypePlugins: Pluggable[] = [
  [rehypeShiki, { theme: ondaShikiTheme, defaultLanguage: 'tsx' }],
];
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins,
  },
};

export function generateStaticParams() {
  return listComponentSlugs().map((slug) => ({ slug }));
}

const KNOWN_SLUGS = new Set(listComponentSlugs());

// Per-component metadata. Title flows through the layout template
// (`%s — Onda`), description comes straight from the component's meta.json.
// Canonical pins to the slug URL so duplicates / query strings don't split
// PageRank.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!KNOWN_SLUGS.has(slug)) return { title: 'Not found' };
  const item = getComponent(slug);
  const path = `/components/${slug}`;
  const url = absoluteUrl(path);
  return {
    title: item.title,
    description: item.description,
    keywords: [...SITE.keywords, ...item.tags, item.name],
    alternates: { canonical: url },
    openGraph: {
      title: `${item.title} — ${SITE.name}`,
      description: item.description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.title} — ${SITE.name}`,
      description: item.description,
    },
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!KNOWN_SLUGS.has(slug)) notFound();

  const item = getComponent(slug);
  const installLine = `npx ondajs add ${slug}`;
  const url = absoluteUrl(`/components/${slug}`);

  // JSON-LD: SoftwareSourceCode is the right schema.org type for a
  // distributable code primitive. Google uses this for richer search results
  // and (eventually) code-block features.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: item.title,
    alternateName: item.name,
    description: item.description,
    url,
    codeRepository: SITE.github,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Remotion',
    keywords: item.tags.join(', '),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
    },
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
  };

  // BreadcrumbList — gives Google the breadcrumb trail it shows above each
  // search result instead of the raw URL. Anchors the page in the catalog
  // hierarchy: Home › Components › <Title>.
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Components',
        item: absoluteUrl('/components'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: item.title,
        item: url,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <main className="flex-1 w-full max-w-125 mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <nav className="text-xs text-onda-faint mb-4">
          <Link href="/components" className="hover:text-onda-dim transition-colors">
            ← Components
          </Link>
        </nav>

        <header className="mb-6 sm:mb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
            {item.category}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {item.title}
          </h1>
          <p className="text-onda-dim mt-3 max-w-80 leading-relaxed">
            {item.description}
          </p>
        </header>

        {/* Live preview (client island) */}
        <section className="mb-6 sm:mb-8">
          <LivePreviewSection slug={slug} />
        </section>

        {/* Install */}
        <section className="mb-8 sm:mb-10 bg-onda-surface border border-onda-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
          <code className="font-mono text-sm text-onda-text overflow-x-auto whitespace-nowrap">
            <span className="text-onda-faint">$</span> {installLine}
          </code>
          <CopyButton text={installLine} />
        </section>

        {/* README — prop table and usage */}
        <article className="prose-onda max-w-none">
          <MDXRemote
            source={item.readme}
            options={mdxOptions}
            components={mdxComponents}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
