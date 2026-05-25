'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOCS_NAV } from '@/lib/docs-nav';

// Persistent left sidebar for /docs/*. Sticky to viewport top so it stays
// visible while the main content scrolls. Active link is the one whose
// `href` matches the current pathname exactly — `/components` highlights
// only when actually at the catalog, etc.
//
// Renders client-side to read `usePathname` for the active state; the rest
// of the page is RSC.

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Documentation"
      className="hidden md:block w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-4"
    >
      <ul className="space-y-6">
        {DOCS_NAV.map((group) => (
          <li key={group.label}>
            <h2 className="text-[10px] uppercase tracking-[0.16em] text-onda-faint mb-2">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        active
                          ? 'block py-1 text-sm font-medium text-onda-text border-l-2 border-onda-accent pl-3 -ml-px'
                          : 'block py-1 text-sm text-onda-dim hover:text-onda-text border-l-2 border-transparent pl-3 -ml-px transition-colors'
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
