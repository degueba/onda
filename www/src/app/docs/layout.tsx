import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { DocsSidebar } from '@/components/DocsSidebar';
import { DocsMobileNav } from '@/components/DocsMobileNav';

// All /docs/* pages share this shell: top Nav, sticky sidebar on the
// left (md+ only), main content in the middle, optional right-rail TOC
// rendered by individual pages, Footer at the bottom.
//
// The main column has no max-width here — each page chooses its own
// content width. Long-form docs (/docs/[slug]) lay out a flex with the
// article + mini-TOC; Getting Started constrains itself to max-w-2xl.

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 flex gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          {/* Mobile/tablet replacement for the desktop sidebar. Hidden
              at md+; renders a collapsed <details> above the article so
              every doc page is still navigable on narrow viewports. */}
          <DocsMobileNav />
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
