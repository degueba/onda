import { dirname, relative, posix, resolve as resolvePath } from 'node:path';
import type { ProjectShape } from './project-shape.js';

// Rewrite import (and export-from) specifiers so installed files resolve in
// the user's project regardless of layout.
//
// The components in this repo import from `../../../lib/<name>` (a relative
// path that's only correct inside our monorepo's `registry/components/<slug>/`
// folder). After install, the lib files land somewhere else entirely —
// `lib/onda/` or `src/lib/onda/` depending on the project — and the relative
// `../../../lib/<name>` no longer points at anything.
//
// Same problem for scene blocks: they import sibling primitives via
// `../<slug>/<Pascal>`. The post-install layout uses the same shape
// (`components/onda/<slug>/<Pascal>`), so a relative path still works
// IF the file is installed alongside the right sibling. We rewrite anyway
// to use the `@/*` alias when available, since aliased imports survive
// future refactors better than counted-dotdots.
//
// Two output modes:
//
//   1. Alias mode — when the project's tsconfig.json declares
//      `compilerOptions.paths["@/*"]` pointing at a src directory and our
//      install paths fall inside it: rewrite to `@/lib/onda/<name>` etc.
//      Clean, refactor-safe, matches what most Next.js / Vite scaffolds set up.
//
//   2. Relative mode — when no alias is configured (or it points elsewhere):
//      compute a real relative path from the importing file's directory to
//      the target file. Always correct, just uglier.
//
// Regex-based by design (per techspec design.md): we own the source, the
// import shapes are uniform (single-quoted, no template literals, no dynamic
// imports of our paths). Switch to a real parser only if this ever bites.

type RewriteContext = {
  /** Absolute path of the file being rewritten (decides relative bases). */
  filePath: string;
  /** Absolute root directory where component folders are written. */
  componentsOut: string;
  /** Absolute root directory where shared lib helpers are written. */
  libOut: string;
  /** Project shape — drives alias-vs-relative mode. */
  shape: ProjectShape;
};

const LIB_IMPORT_RE = /from\s+(['"])(\.\.\/\.\.\/\.\.\/lib\/([a-z-]+))\1/g;
const SIBLING_IMPORT_RE =
  /from\s+(['"])(\.\.\/([a-z][a-z0-9-]*)\/([A-Z][A-Za-z0-9]*))\1/g;

/**
 * Run both rewrite passes against a file's contents.
 *
 * Pure transform — caller is responsible for writing the result back.
 */
export function rewriteImports(content: string, ctx: RewriteContext): string {
  let out = content;
  out = out.replace(LIB_IMPORT_RE, (_match, quote, _spec, libName) => {
    const target = resolvePath(ctx.libOut, `${libName}.ts`);
    const newSpec = pickImportSpec(target, ctx);
    return `from ${quote}${newSpec}${quote}`;
  });
  out = out.replace(
    SIBLING_IMPORT_RE,
    (_match, quote, _spec, slug, componentName) => {
      const target = resolvePath(
        ctx.componentsOut,
        slug,
        `${componentName}.tsx`,
      );
      const newSpec = pickImportSpec(target, ctx);
      return `from ${quote}${newSpec}${quote}`;
    },
  );
  return out;
}

/**
 * Decide whether to emit an `@/…` aliased spec or a computed relative path,
 * and return the appropriate specifier (extension-less, POSIX-style).
 *
 * Alias mode requires:
 *   - tsconfig declares `paths["@/*"]: ["./src/*"]` (or similar)
 *   - The target file falls *inside* that alias root
 *
 * If either fails, we fall back to relative form so the import is at least
 * correct, even if uglier.
 */
function pickImportSpec(targetFile: string, ctx: RewriteContext): string {
  const aliasSpec = tryAliasSpec(targetFile, ctx);
  if (aliasSpec !== null) return aliasSpec;
  return relativeSpec(targetFile, ctx.filePath);
}

function tryAliasSpec(
  targetFile: string,
  ctx: RewriteContext,
): string | null {
  if (!ctx.shape.pathsAlias) return null;

  // Resolve the alias target (e.g. "./src/*") to an absolute path. The "/*"
  // suffix is part of the alias contract — it's a wildcard. We strip the
  // "/*" off both sides to get the root directory the alias maps onto.
  if (!ctx.shape.pathsAlias.endsWith('/*')) return null;
  const aliasRootRel = ctx.shape.pathsAlias.slice(0, -2);
  const aliasRootAbs = resolvePath(ctx.shape.cwd, aliasRootRel);

  // Is the target inside the alias root? Use the resolved relative path —
  // if it doesn't start with `..`, the target is inside.
  const fromAliasRoot = relative(aliasRootAbs, targetFile);
  if (fromAliasRoot.startsWith('..') || fromAliasRoot.startsWith('/')) {
    return null;
  }

  // Drop the extension and force POSIX-style separators for the import.
  const noExt = fromAliasRoot.replace(/\.(tsx?|jsx?)$/, '');
  const posixPath = noExt.split(/[\\/]/).join('/');
  return `@/${posixPath}`;
}

function relativeSpec(targetFile: string, fromFile: string): string {
  const fromDir = dirname(fromFile);
  const rel = relative(fromDir, targetFile);
  // path.relative drops the `./` prefix on same-or-descendant paths; module
  // resolvers (Node, bundlers, TS) require it to distinguish a relative
  // path from a bare specifier. Add it back when the path doesn't already
  // start with `.`.
  const withPrefix = rel.startsWith('.') ? rel : `./${rel}`;
  const noExt = withPrefix.replace(/\.(tsx?|jsx?)$/, '');
  // posix.normalize collapses any oddness; force POSIX separators since
  // imports use forward slashes on every platform.
  return posix.normalize(noExt.split(/[\\/]/).join('/'));
}
