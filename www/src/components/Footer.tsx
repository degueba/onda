export function Footer() {
  return (
    // Inner row tracks the widest page container (the docs shell at
    // `max-w-7xl`) so the footer doesn't read as a stranded narrow
    // strip under a wide page. On narrower pages (home, showcase) the
    // text simply sits a bit further left within the row — acceptable
    // because the full-width top border still anchors the page baseline.
    <footer className="w-full border-t border-onda-border mt-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-onda-faint">
        <p>
          MIT licensed. Built with{' '}
          <a
            href="https://remotion.dev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-onda-dim transition-colors"
          >
            Remotion
          </a>
          .
        </p>
        <p>
          <a
            href="https://github.com/degueba/onda"
            target="_blank"
            rel="noreferrer"
            className="hover:text-onda-dim transition-colors"
          >
            github.com/degueba/onda
          </a>
        </p>
      </div>
    </footer>
  );
}
