import GithubSlugger from 'github-slugger';
import { DOCS_NAV, type DocsLink } from './docs-nav';

// Parsing + navigation helpers for the long-form docs surface. Pure
// functions over the raw markdown source and the sidebar nav data — no
// I/O, no React. Tested incidentally by every slug page that uses them.

export type TocHeading = {
  depth: 2 | 3;
  text: string;
  /** GitHub-compatible slug, matching the ids that `rehype-slug` injects
   *  on the rendered HTML. Generated with the same `github-slugger`
   *  instance per document so duplicates dedupe identically. */
  id: string;
};

const FENCE_RE = /^(```|~~~)/;
const H2_RE = /^##\s+(.+?)\s*$/;
const H3_RE = /^###\s+(.+?)\s*$/;

/** Strip the lightweight markdown syntax that affects rendered text
 *  (backticks, emphasis, links) so the slug computed here matches what
 *  rehype-slug will compute on the rendered HTML. */
function plainText(md: string): string {
  return md
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

/**
 * Extract h2/h3 headings from raw markdown for the right-rail TOC.
 * Skips headings inside fenced code blocks (otherwise a `## ` in a
 * tsx example would show up as a fake section).
 */
export function extractToc(source: string): TocHeading[] {
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];
  let inFence = false;

  for (const rawLine of source.split('\n')) {
    if (FENCE_RE.test(rawLine)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m2 = rawLine.match(H2_RE);
    const m3 = rawLine.match(H3_RE);
    const match = m2 ?? m3;
    if (!match) continue;

    const text = plainText(match[1]).trim();
    if (!text) continue;
    headings.push({
      depth: m2 ? 2 : 3,
      text,
      id: slugger.slug(text),
    });
  }
  return headings;
}

/**
 * Remove the leading `# Heading` from a markdown source so the article
 * shell (rendered as JSX) can own the h1 instead of duplicating it
 * inside the MDX body.
 */
export function stripLeadingH1(source: string): string {
  return source.replace(/^#\s+[^\n]*\n+/, '');
}

/** Flatten the sidebar nav into a reading order — used to compute the
 *  prev/next pager at the bottom of every long doc. */
function flatNav(): Array<DocsLink & { group: string }> {
  return DOCS_NAV.flatMap((g) =>
    g.items.map((item) => ({ ...item, group: g.label })),
  );
}

/** The group label a given href belongs to ("Foundations", "Composing"…)
 *  — surfaced as the eyebrow over the page title. */
export function getDocGroup(href: string): string | null {
  for (const g of DOCS_NAV) {
    if (g.items.some((item) => item.href === href)) return g.label;
  }
  return null;
}

/** Prev/next reading neighbours from the flattened sidebar order. */
export function getDocNeighbors(href: string): {
  prev: DocsLink | null;
  next: DocsLink | null;
} {
  const flat = flatNav();
  const idx = flat.findIndex((item) => item.href === href);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
