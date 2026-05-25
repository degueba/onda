#!/usr/bin/env node
// One-time codemod for issue #27: bake `kind: z.literal("<slug>").default("<slug>")`
// as the FIRST field of every component / transition schema.
//
// Uses TypeScript's compiler API to find the `z.object({...})` call
// inside each schema.ts and inject the kind field at the top of its
// object-literal argument. AST-based so nested calls don't trip it up.
//
// `.default("<slug>")` is intentional — non-breaking. Existing consumers
// calling `schema.parse({})` keep working; the field auto-populates with
// the slug. Per issue #27's "alternative" path.

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

const ROOT = '/Users/rodrigosilva/dev/onda';
const ROOTS = [
  resolve(ROOT, 'registry/components'),
  resolve(ROOT, 'registry/transitions'),
];

function parseTS(path, text) {
  return ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TS,
  );
}

function findSchemaObjectLiteral(sourceFile) {
  // Find: `export const <name>Schema = z.object({ ... })`
  // We need the ObjectLiteralExpression argument to z.object().
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
    if (!d.initializer || !ts.isCallExpression(d.initializer)) continue;

    // Walk down: z.object(...) — top-level expression should be a
    // PropertyAccessExpression `z.object`
    const call = d.initializer;
    if (
      ts.isPropertyAccessExpression(call.expression) &&
      ts.isIdentifier(call.expression.expression) &&
      call.expression.expression.text === 'z' &&
      call.expression.name.text === 'object'
    ) {
      const arg = call.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        return { schemaName: d.name.text, objectLiteral: arg };
      }
    }
  }
  return null;
}

function refactor(slug, schemaPath) {
  const text = readFileSync(schemaPath, 'utf8');
  const sourceFile = parseTS(schemaPath, text);

  const found = findSchemaObjectLiteral(sourceFile);
  if (!found) {
    return { skipped: true, reason: 'no top-level z.object schema found' };
  }
  const { objectLiteral } = found;

  // Idempotency: if the object literal already starts with a `kind:`
  // PropertyAssignment, leave it alone.
  const first = objectLiteral.properties[0];
  if (
    first &&
    ts.isPropertyAssignment(first) &&
    ts.isIdentifier(first.name) &&
    first.name.text === 'kind'
  ) {
    return { skipped: true, reason: 'kind already present' };
  }

  // Build the new field text. Place it immediately after the `{`,
  // indented two spaces to match the rest of the schema body.
  const kindLine =
    `  /** Discriminator literal — matches this entry's registry slug. ` +
    `Auto-populated when omitted (\`schema.parse({})\` works as before). ` +
    `Lets consumers build \`z.discriminatedUnion('kind', [...])\` directly ` +
    `over onda schemas. */\n` +
    `  kind: z.literal('${slug}').default('${slug}'),\n`;

  // Find the position right after the opening `{` of the object literal.
  // objectLiteral.getStart() is the `{`. We want to insert immediately
  // after it + a newline (the existing first property starts on the next
  // line in every schema).
  const openBracePos = objectLiteral.getStart(sourceFile);
  const insertAt = openBracePos + 1; // right after `{`
  // The text right after `{` is `\n` in our schemas. We insert
  // `\n  /** ... */\n  kind: ...,` so the structure becomes:
  //   z.object({
  //     /** ... */
  //     kind: ...,
  //     /** original first field */
  //     ...
  //   })
  const before = text.slice(0, insertAt);
  const after = text.slice(insertAt);
  // `after` starts with `\n` (object body), our kindLine ends with `\n`,
  // so the joined result is: `{\n<kindLine>...existing body...`
  const updated = before + '\n' + kindLine + after.replace(/^\n+/, '');

  writeFileSync(schemaPath, updated);
  return { touched: true, schemaName: found.schemaName };
}

let touched = 0;
let skipped = 0;
const issues = [];

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const slug of readdirSync(root).sort()) {
    const schemaPath = resolve(root, slug, 'schema.ts');
    if (!existsSync(schemaPath)) continue;

    try {
      const r = refactor(slug, schemaPath);
      if (r.skipped) {
        issues.push(`${slug}: ${r.reason}`);
        skipped++;
      } else {
        touched++;
        console.log(`  ${slug} (${r.schemaName})`);
      }
    } catch (err) {
      issues.push(`${slug}: ${err.message}`);
      skipped++;
    }
  }
}

console.log(`\nDone: touched=${touched}, skipped=${skipped}`);
if (issues.length > 0) {
  console.log('\nNotes:');
  for (const i of issues) console.log(`  - ${i}`);
}
