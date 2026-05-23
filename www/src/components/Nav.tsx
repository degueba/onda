import Link from 'next/link';

export function Nav() {
  return (
    <nav className="w-full border-b border-onda-border">
      <div className="max-w-150 mx-auto px-3 sm:px-4 h-8 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-onda-text hover:opacity-80 transition-opacity"
        >
          Onda
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/components"
            className="text-onda-dim hover:text-onda-text transition-colors"
          >
            Components
          </Link>
          <a
            href="https://github.com/botelhodeveloper/onda"
            target="_blank"
            rel="noreferrer"
            className="text-onda-dim hover:text-onda-text transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
