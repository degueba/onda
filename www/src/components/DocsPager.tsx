import Link from 'next/link';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import type { DocsLink } from '@/lib/docs-nav';

// Prev/next reading pager at the foot of every long-form doc. Mirrors
// the sidebar's reading order so a visitor can flow through the docs
// without bouncing back to the nav. Either half can be absent (first
// or last page) — when one side is empty we still grid-place the other
// so the visible card stays right-aligned for `next` and left-aligned
// for `prev`.

export function DocsPager({
  prev,
  next,
}: {
  prev: DocsLink | null;
  next: DocsLink | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Doc navigation"
      className="mt-12 sm:mt-16 pt-8 border-t border-onda-border grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="
            group block rounded-xl border border-onda-border
            hover:border-onda-border-lit hover:bg-onda-surface
            transition-colors px-4 py-3
          "
        >
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-onda-faint">
            <ArrowLeft size={11} weight="bold" />
            Previous
          </span>
          <span className="block mt-1 text-sm font-medium text-onda-text group-hover:text-onda-accent transition-colors">
            {prev.label}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={next.href}
          className="
            group block rounded-xl border border-onda-border
            hover:border-onda-border-lit hover:bg-onda-surface
            transition-colors px-4 py-3 sm:text-right
          "
        >
          <span className="flex items-center sm:justify-end gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-onda-faint">
            Next
            <ArrowRight size={11} weight="bold" />
          </span>
          <span className="block mt-1 text-sm font-medium text-onda-text group-hover:text-onda-accent transition-colors">
            {next.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
