export function Footer() {
  return (
    <footer className="w-full border-t border-onda-border mt-10">
      <div className="max-w-150 mx-auto px-3 sm:px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-onda-faint">
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
            href="https://github.com/botelhodeveloper/onda"
            target="_blank"
            rel="noreferrer"
            className="hover:text-onda-dim transition-colors"
          >
            github.com/botelhodeveloper/onda
          </a>
        </p>
      </div>
    </footer>
  );
}
