'use client';

import { useEffect, useState } from 'react';
import type { TocHeading } from '@/lib/docs';

// Right-rail "On this page" mini-TOC. Sticky to the viewport top so it
// stays oriented as the reader scrolls. Highlights the heading nearest
// the top of the viewport via an IntersectionObserver — works for the
// reader who scrolls naturally as well as the one who jumps via hash.
//
// Hidden below lg (1024px). On narrow viewports the article column
// would have to squeeze too small to fit a rail; the readers there can
// still use Ctrl-F or the sidebar's page list.

export function DocsToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const targets: HTMLElement[] = [];
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el instanceof HTMLElement) targets.push(el);
    }
    if (targets.length === 0) return;

    // Observe a thin band near the top of the viewport. A heading is
    // "active" as soon as it crosses that band on the way up, and
    // releases as it scrolls past. The band height controls how
    // "predictive" the highlight feels — too tall and a heading lights
    // up before reaching the top; too thin and the highlight strobes.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '0px 0px -75% 0px', threshold: [0, 1] },
    );

    for (const t of targets) observer.observe(t);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="hidden xl:block w-24 shrink-0 sticky top-2 self-start max-h-[calc(100vh-1.5rem)] overflow-y-auto"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-onda-faint mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`
                block py-1 text-xs leading-snug
                border-l-2 transition-colors
                ${h.depth === 3 ? 'pl-5 -ml-px' : 'pl-3 -ml-px'}
                ${
                  activeId === h.id
                    ? 'text-onda-text border-onda-accent'
                    : 'text-onda-dim hover:text-onda-text border-transparent'
                }
              `}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
