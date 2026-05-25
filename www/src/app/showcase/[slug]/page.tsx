import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeShiki from '@shikijs/rehype';
import type { Pluggable } from 'unified';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { CodeBlock } from '@/components/CodeBlock';
import { ShowcasePreview } from '@/components/ShowcasePreview';
import { SHOWCASES, getShowcase, SHOWCASE_SLUGS } from '@/lib/showcase';
import { ondaShikiTheme } from '@/lib/onda-shiki-theme';
import { SITE, absoluteUrl } from '@/lib/seo';

// Same MDX → Shiki → CodeBlock pipeline the docs and component pages use.
// Code is fenced into a tiny synthesized markdown doc so it picks up the
// shared syntax-highlighting theme and copy affordance instead of being a
// flat <pre><code> dump.
const mdxComponents = { pre: CodeBlock };
const rehypePlugins: Pluggable[] = [
  [rehypeShiki, { theme: ondaShikiTheme, defaultLanguage: 'tsx' }],
];
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins,
  },
};

// Each showcase detail page renders:
//   - live preview at the top (Player)
//   - the source composition.tsx inlined below (so visitors can copy
//     it without leaving the page — the whole point of a showcase
//     is fork-and-modify)
//   - links to install-individually for each component used
//
// Source is read at build time via Node fs from the showcase folder.

const REPO_ROOT = resolve(process.cwd(), '..');
const SHOWCASE_DIR = resolve(REPO_ROOT, 'www/src/showcase');

export function generateStaticParams() {
  return SHOWCASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const showcase = getShowcase(slug);
  if (!showcase) return { title: 'Not found' };
  const url = absoluteUrl(`/showcase/${slug}`);
  return {
    title: showcase.title,
    description: showcase.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${showcase.title} — ${SITE.name}`,
      description: showcase.description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${showcase.title} — ${SITE.name}`,
      description: showcase.description,
    },
  };
}

function readSource(slug: string): string {
  return readFileSync(resolve(SHOWCASE_DIR, slug, 'composition.tsx'), 'utf8');
}

// Wrap raw source in a 4-tilde fenced block. Tildes (not backticks) so
// embedded template literals in the source can't accidentally close the
// fence. The MDX pipeline then runs Shiki over it.
function fenceAsMdx(source: string): string {
  return `~~~~tsx\n${source}\n~~~~\n`;
}

export default async function ShowcaseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const showcase = getShowcase(slug);
  if (!showcase) notFound();

  const source = readSource(slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 w-full max-w-180 mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <div className="mb-6">
          <Link
            href="/showcase"
            className="text-[11px] uppercase tracking-[0.16em] text-onda-faint hover:text-onda-text transition-colors"
          >
            ← All showcases
          </Link>
        </div>

        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-2 font-mono">
            {showcase.width}×{showcase.height} · {showcase.duration}s · {showcase.fps}fps
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {showcase.title}
          </h1>
          <p className="text-onda-dim mt-3 leading-relaxed">
            {showcase.description}
          </p>
        </header>

        <section className="mb-8">
          <ShowcasePreview meta={showcase} />
        </section>

        <section className="mb-8">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-mono text-xs text-onda-faint tabular-nums">SRC</span>
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-onda-text">
              The whole composition
            </h2>
          </div>
          <p className="text-onda-dim mb-4 leading-relaxed">
            Below is the entire source for this showcase — every component, every transition, every prop. Copy it into your Remotion project as a starting point, then swap copy, swap colors, swap timing.
          </p>
          <article className="prose-onda max-w-none">
            <MDXRemote
              source={fenceAsMdx(source)}
              options={mdxOptions}
              components={mdxComponents}
            />
          </article>
        </section>

        <section className="border-t border-onda-border pt-6">
          <h3 className="font-display text-lg font-semibold tracking-tight text-onda-text mb-3">
            Install the pieces
          </h3>
          <p className="text-sm text-onda-dim mb-3 leading-relaxed">
            This showcase uses the following Onda categories — every item is one CLI install:
          </p>
          <ul className="text-sm text-onda-dim space-y-1.5 leading-relaxed">
            {showcase.categoriesUsed.map((cat) => (
              <li key={cat}>
                <code className="text-onda-text font-mono">{cat}</code>
              </li>
            ))}
          </ul>
          <p className="text-sm text-onda-dim mt-4 leading-relaxed">
            Browse the{' '}
            <Link href="/components" className="text-onda-text underline decoration-onda-border-lit underline-offset-[3px] hover:decoration-onda-accent transition-colors">
              full component catalog
            </Link>
            {' '}for the individual slugs.
          </p>
        </section>

        <section className="border-t border-onda-border mt-10 pt-8">
          <h3 className="font-display text-lg font-semibold tracking-tight text-onda-text mb-4">
            Other showcases
          </h3>
          <ul className="text-sm space-y-2 leading-relaxed">
            {SHOWCASES.filter((s) => s.slug !== slug).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/showcase/${s.slug}`}
                  className="text-onda-text hover:text-onda-accent transition-colors"
                >
                  {s.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
