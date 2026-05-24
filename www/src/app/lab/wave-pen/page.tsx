import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WavePenLab } from './WavePenLab';

// Sandbox for the "moving pen as motion graphic" experiment. The pen is
// a glowing dot that physically travels along a curved path across the
// canvas, leaving a trail; text appears as the pen passes through the
// writing area. Validates the "dot is the protagonist" direction before
// committing it to the hero.

export const metadata = {
  title: 'Lab — Moving Pen',
};

export default function WavePenLabPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-150 mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
            Lab — Moving-pen prototype
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            The pen travels
          </h1>
          <p className="text-onda-dim mt-2 max-w-100">
            A glowing dot enters from off-screen, glides across the canvas
            along a curving path, leaves an accent-rose trail, and text
            fades in as the pen passes the writing area. The dot IS the
            protagonist. Scrub through 6 seconds.
          </p>
        </header>

        <div className="aspect-video rounded-2xl overflow-hidden border border-onda-border bg-onda-bg shadow-[0_30px_60px_-34px_rgba(0,0,0,0.9)]">
          <WavePenLab />
        </div>
      </main>
      <Footer />
    </div>
  );
}
