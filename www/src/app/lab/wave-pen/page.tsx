import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WavePenLab } from './WavePenLab';

// Sandbox page for the WavePen "wave writes phrases" experiment. Renders
// a 9-second test composition in a Remotion Player so the WavePen can be
// scrubbed and reviewed before deciding to ship the idea into the hero.

export const metadata = {
  title: 'Lab — WavePen',
};

export default function WavePenLabPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-150 mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-onda-faint mb-2">
            Lab — Wave-writes-phrases experiment
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            WavePen
          </h1>
          <p className="text-onda-dim mt-2 max-w-100">
            Tier-1 prototype. Caveat handwriting font, SVG text with a
            stroked outline that draws itself in via animated
            strokeDashoffset. Three phrases play in sequence; scrub the
            player to judge the writing feel.
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
