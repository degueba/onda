import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { DocsSidebar } from '@/components/DocsSidebar';

// All /docs/* pages share this shell: Nav on top, sticky sidebar on the
// left (md+ only), main content in the middle, Footer at the bottom.
// Individual page.tsx files render JUST their content — no Nav/Footer
// wrappers per page.

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 flex gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-3xl">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
