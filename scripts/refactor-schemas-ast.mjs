#!/usr/bin/env node
// One-time refactor: move every component / transition's Zod schema
// (and any local helper consts it depends on, plus its `Props` /
// `Options` type alias) from the implementation .tsx file into its
// sibling `schema.ts`. Routes `lib/canvas` imports referenced by
// schemas to `lib/canvas-schemas` so the manifest bundle stops
// dragging React + Remotion through.
//
// Uses TypeScript's compiler API for AST-level parsing.
//
// Per-file algorithm:
//   1. Parse the implementation file (.tsx) as a source file
//   2. Find the schema VariableStatement (init is a CallExpression
//      on `z.*`) and the inferred Props/Options type alias
//   3. Recursively find LOCAL helper consts that the schema uses
//      (these get moved along — e.g. audio-clip's `const timeSpec`)
//   4. Determine which named imports are needed by the moved set
//      vs. by the rest of the file; rebuild both import lists
//   5. Re-route `lib/canvas` imports for schema-side bindings to
//      `lib/canvas-schemas`
//   6. Emit schema.ts: imports + helpers + schema + type
//   7. Rewrite impl file: trimmed imports + the original body minus
//      the moved blocks + back-compat re-export line

import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = resolve(process.argv[2] ?? '/Users/rodrigosilva/dev/onda');
const ROOTS = [
  resolve(ROOT, 'registry/components'),
  resolve(ROOT, 'registry/transitions'),
];

const CANVAS_SCHEMAS_SYMBOLS = new Set([
  'ANCHORS',
  'Anchor',
  'anchorSchema',
  'PlacementCoords',
  'placementCoordsSchema',
  'PLACEMENT_REGIONS',
  'PlacementRegion',
  'placementRegionSchema',
  'Placement',
  'placementSchema',
  'SIZE_ROLES',
  'SizeRole',
  'sizeRoleSchema',
]);

function parseTSX(path, text) {
  return ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );
}

function collectIdentifiers(node, set) {
  ts.forEachChild(node, (child) => {
    if (ts.isIdentifier(child)) set.add(child.text);
    collectIdentifiers(child, set);
  });
}

function initializerStartsWithZ(init) {
  let cur = init;
  while (cur) {
    if (
      ts.isPropertyAccessExpression(cur) &&
      ts.isIdentifier(cur.expression) &&
      cur.expression.text === 'z'
    )
      return true;
    if (ts.isCallExpression(cur)) cur = cur.expression;
    else if (ts.isPropertyAccessExpression(cur)) cur = cur.expression;
    else break;
  }
  return false;
}

function findSchemaStatement(sourceFile) {
  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (
      !stmt.modifiers ||
      !stmt.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue;
    const decls = stmt.declarationList.declarations;
    if (decls.length !== 1) continue;
    const d = decls[0];
    if (!ts.isIdentifier(d.name) || !/Schema$/.test(d.name.text)) continue;
    if (!d.initializer) continue;
    if (!initializerStartsWithZ(d.initializer)) continue;
    return { node: stmt, name: d.name.text };
  }
  return null;
}

function findInferredTypeAlias(sourceFile, schemaName) {
  for (const stmt of sourceFile.statements) {
    if (!ts.isTypeAliasDeclaration(stmt)) continue;
    if (
      !stmt.modifiers ||
      !stmt.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue;
    const t = stmt.type;
    if (!ts.isTypeReferenceNode(t)) continue;
    if (!ts.isQualifiedName(t.typeName)) continue;
    if (t.typeName.left.text !== 'z') continue;
    if (t.typeName.right.text !== 'infer' && t.typeName.right.text !== 'input')
      continue;
    const ta = t.typeArguments?.[0];
    if (!ta || !ts.isTypeQueryNode(ta)) continue;
    if (!ts.isIdentifier(ta.exprName)) continue;
    if (ta.exprName.text !== schemaName) continue;
    return { node: stmt, name: stmt.name.text };
  }
  return null;
}

function nodeFullText(node, sourceFile) {
  return sourceFile.text.slice(node.getFullStart(), node.getEnd());
}

function parseImports(sourceFile) {
  const imports = [];
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    const specRaw = stmt.moduleSpecifier;
    if (!ts.isStringLiteral(specRaw)) continue;
    const ic = stmt.importClause;
    const result = {
      node: stmt,
      specifier: specRaw.text,
      typeOnly: Boolean(ic?.isTypeOnly),
      defaultBinding: null,
      namespaceBinding: null,
      namedBindings: [],
      sideEffectOnly: false,
    };
    if (!ic) {
      result.sideEffectOnly = true;
    } else {
      if (ic.name) result.defaultBinding = ic.name.text;
      if (ic.namedBindings) {
        if (ts.isNamespaceImport(ic.namedBindings)) {
          result.namespaceBinding = ic.namedBindings.name.text;
        } else if (ts.isNamedImports(ic.namedBindings)) {
          for (const el of ic.namedBindings.elements) {
            const orig = el.propertyName?.text ?? el.name.text;
            result.namedBindings.push({
              orig,
              alias: el.name.text,
              typeOnly: Boolean(el.isTypeOnly),
            });
          }
        }
      }
    }
    imports.push(result);
  }
  return imports;
}

function renderImport(imp) {
  if (imp.sideEffectOnly) return `import '${imp.specifier}';`;
  const parts = [];
  if (imp.defaultBinding) parts.push(imp.defaultBinding);
  if (imp.namespaceBinding) parts.push(`* as ${imp.namespaceBinding}`);
  if (imp.namedBindings.length > 0) {
    const named = imp.namedBindings
      .map((n) => {
        const aliasPart =
          n.orig === n.alias ? n.orig : `${n.orig} as ${n.alias}`;
        return (n.typeOnly ? 'type ' : '') + aliasPart;
      })
      .join(', ');
    parts.push(`{ ${named} }`);
  }
  if (parts.length === 0) return null;
  const typePrefix = imp.typeOnly ? 'type ' : '';
  return `import ${typePrefix}${parts.join(', ')} from '${imp.specifier}';`;
}

const isCanvasSpecifier = (s) => /\/lib\/canvas$/.test(s);
const toCanvasSchemasSpecifier = (s) =>
  s.replace(/\/lib\/canvas$/, '/lib/canvas-schemas');

/**
 * Find all top-level non-exported VariableStatements (single declaration)
 * the schema (transitively) references by identifier name. These get
 * moved alongside the schema so the schema.ts module is self-contained.
 */
function findLocalHelpers(sourceFile, seedIds) {
  const candidates = new Map(); // name -> { stmt, declName }
  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExported = stmt.modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (isExported) continue;
    const decls = stmt.declarationList.declarations;
    if (decls.length !== 1) continue;
    const d = decls[0];
    if (!ts.isIdentifier(d.name)) continue;
    if (!d.initializer) continue;
    candidates.set(d.name.text, { stmt, declName: d.name.text });
  }

  const moved = new Map();
  const queue = [...seedIds];
  while (queue.length > 0) {
    const id = queue.shift();
    if (moved.has(id)) continue;
    const cand = candidates.get(id);
    if (!cand) continue;
    moved.set(id, cand);
    const helperIds = new Set();
    collectIdentifiers(cand.stmt, helperIds);
    for (const next of helperIds) {
      if (!moved.has(next) && candidates.has(next)) queue.push(next);
    }
  }
  return [...moved.values()];
}

function refactorFile(implPath, schemaPath) {
  const implText = readFileSync(implPath, 'utf8');
  const sourceFile = parseTSX(implPath, implText);

  const schema = findSchemaStatement(sourceFile);
  if (!schema) return { skipped: true, reason: 'no schema VariableStatement' };
  const propsType = findInferredTypeAlias(sourceFile, schema.name);

  // Seed: identifiers used inside schema (+ props type)
  const schemaUsedIds = new Set();
  collectIdentifiers(schema.node, schemaUsedIds);
  if (propsType) collectIdentifiers(propsType.node, schemaUsedIds);

  // Find local helper consts the schema (transitively) depends on
  const helpers = findLocalHelpers(sourceFile, schemaUsedIds);
  for (const h of helpers) collectIdentifiers(h.stmt, schemaUsedIds);

  const movedNodes = new Set([schema.node]);
  if (propsType) movedNodes.add(propsType.node);
  for (const h of helpers) movedNodes.add(h.stmt);

  // Identifiers used elsewhere (excluding moved nodes + imports)
  const elsewhereIds = new Set();
  for (const stmt of sourceFile.statements) {
    if (movedNodes.has(stmt)) continue;
    if (ts.isImportDeclaration(stmt)) continue;
    collectIdentifiers(stmt, elsewhereIds);
    if (stmt.name && ts.isIdentifier(stmt.name)) {
      elsewhereIds.add(stmt.name.text);
    }
  }

  const imports = parseImports(sourceFile);
  const schemaImports = [];
  const updatedImports = [];

  for (const imp of imports) {
    if (imp.sideEffectOnly) {
      updatedImports.push(imp);
      continue;
    }
    const schemaNamed = [];
    const remainingNamed = [];
    for (const n of imp.namedBindings) {
      const usedInSchema = schemaUsedIds.has(n.alias);
      const usedElsewhere = elsewhereIds.has(n.alias);
      if (usedInSchema) schemaNamed.push(n);
      if (usedElsewhere) remainingNamed.push(n);
    }
    const remaining = { ...imp, namedBindings: remainingNamed };
    if (
      remaining.namedBindings.length > 0 ||
      remaining.defaultBinding ||
      remaining.namespaceBinding ||
      remaining.sideEffectOnly
    ) {
      updatedImports.push(remaining);
    }
    if (schemaNamed.length > 0) {
      let targetSpec = imp.specifier;
      if (isCanvasSpecifier(imp.specifier)) {
        const offending = schemaNamed.filter(
          (n) => !CANVAS_SCHEMAS_SYMBOLS.has(n.orig),
        );
        if (offending.length > 0) {
          console.warn(
            `  ! ${implPath}: schema references non-schema canvas symbols: ${offending.map((o) => o.orig).join(', ')}`,
          );
        }
        targetSpec = toCanvasSchemasSpecifier(imp.specifier);
      }
      schemaImports.push({
        sideEffectOnly: false,
        typeOnly: imp.typeOnly,
        defaultBinding: null,
        namespaceBinding: null,
        namedBindings: schemaNamed,
        specifier: targetSpec,
      });
    }
  }

  // Ensure z import in schema.ts
  const hasZ = schemaImports.some(
    (imp) =>
      imp.specifier === 'zod' && imp.namedBindings.some((n) => n.alias === 'z'),
  );
  const schemaImportLines = [];
  if (!hasZ) schemaImportLines.push(`import { z } from 'zod';`);
  for (const imp of schemaImports) {
    const r = renderImport(imp);
    if (r) schemaImportLines.push(r);
  }

  const helperBlocks = helpers
    .sort((a, b) => a.stmt.getFullStart() - b.stmt.getFullStart())
    .map((h) => nodeFullText(h.stmt, sourceFile).replace(/^\s*\n+/, ''));
  const schemaBlock = nodeFullText(schema.node, sourceFile).replace(/^\s*\n+/, '');
  const propsBlock = propsType
    ? nodeFullText(propsType.node, sourceFile).replace(/^\s*\n+/, '')
    : '';

  const schemaContent =
    schemaImportLines.join('\n') +
    '\n\n' +
    (helperBlocks.length > 0 ? helperBlocks.join('\n\n') + '\n\n' : '') +
    schemaBlock +
    (propsType ? '\n\n' + propsBlock : '') +
    '\n';

  // Build new impl file: slice original text but skip moved-node ranges
  const ranges = [...movedNodes]
    .map((n) => ({ start: n.getFullStart(), end: n.getEnd() }))
    .sort((a, b) => a.start - b.start);

  let kept = '';
  let cursor = 0;
  for (const r of ranges) {
    kept += implText.slice(cursor, r.start);
    cursor = r.end;
  }
  kept += implText.slice(cursor);

  const importEnds = imports.map((i) => i.node.getEnd()).sort((a, b) => a - b);
  const lastImportEnd = importEnds[importEnds.length - 1] ?? 0;
  const bodyAfterImports = kept.slice(lastImportEnd);

  const renderedImports = [];
  for (const imp of updatedImports) {
    const r = renderImport(imp);
    if (r) renderedImports.push(r);
  }
  const propsFrag = propsType ? `, type ${propsType.name}` : '';
  renderedImports.push(
    `import { ${schema.name}${propsFrag} } from './schema';`,
  );
  const reExportLine = propsType
    ? `\nexport { ${schema.name}, type ${propsType.name} };\n`
    : `\nexport { ${schema.name} };\n`;

  const firstImportFullStart = imports[0]?.node.getFullStart() ?? 0;
  const firstImportStart = imports[0]?.node.getStart(sourceFile) ?? 0;
  const leadingComments = implText.slice(
    firstImportFullStart,
    firstImportStart,
  );

  const newImplContent =
    leadingComments +
    renderedImports.join('\n') +
    '\n' +
    reExportLine +
    bodyAfterImports.replace(/^\s*\n+/, '\n');

  writeFileSync(schemaPath, schemaContent);
  writeFileSync(implPath, newImplContent);
  return { touched: true, movedHelpers: helpers.length };
}

let touched = 0;
let alreadyCanonical = 0;
let canvasOnlyRewrites = 0;
let skipped = 0;
let totalHelpers = 0;
const issues = [];

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const slug of readdirSync(root).sort()) {
    const dir = resolve(root, slug);
    const schemaPath = resolve(dir, 'schema.ts');
    if (!existsSync(schemaPath)) continue;

    const schemaText = readFileSync(schemaPath, 'utf8');
    const isCanonical = /^export const \w+Schema = z\./m.test(schemaText);

    if (isCanonical) {
      const rewritten = schemaText.replace(
        /from ['"](\.\.\/\.\.\/\.\.\/lib\/canvas)['"]/g,
        `from '../../../lib/canvas-schemas'`,
      );
      if (rewritten !== schemaText) {
        writeFileSync(schemaPath, rewritten);
        canvasOnlyRewrites++;
        console.log(`  canvas→canvas-schemas: ${slug}`);
      }
      alreadyCanonical++;
      continue;
    }

    const reExportMatch = schemaText.match(
      /export\s+\{[^}]+\}\s+from\s+['"]\.\/([^'"]+)['"];?/,
    );
    if (!reExportMatch) {
      issues.push(`${slug}: not canonical, not a re-export`);
      skipped++;
      continue;
    }
    const sourceBase = reExportMatch[1];
    const implPath = [`${sourceBase}.tsx`, `${sourceBase}.ts`]
      .map((c) => resolve(dir, c))
      .find((p) => existsSync(p));
    if (!implPath) {
      issues.push(`${slug}: impl file not found`);
      skipped++;
      continue;
    }

    try {
      const r = refactorFile(implPath, schemaPath);
      if (r.skipped) {
        issues.push(`${slug}: ${r.reason}`);
        skipped++;
      } else {
        touched++;
        totalHelpers += r.movedHelpers ?? 0;
        const tag = r.movedHelpers > 0 ? ` (+${r.movedHelpers} helpers)` : '';
        console.log(`  refactored: ${slug}${tag}`);
      }
    } catch (err) {
      issues.push(`${slug}: ${err.message}`);
      skipped++;
    }
  }
}

console.log(
  `\nDone: touched=${touched}, already-canonical=${alreadyCanonical}, canvas-only rewrites=${canvasOnlyRewrites}, skipped=${skipped}, helpers moved=${totalHelpers}`,
);
if (issues.length > 0) {
  console.log('\nIssues:');
  for (const i of issues) console.log(`  - ${i}`);
}
