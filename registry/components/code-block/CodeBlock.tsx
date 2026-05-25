import React from 'react';
import { PlacementBox } from '../../../lib/canvas';
import { Surface } from '../../../lib/primitives';
import { useStaggeredEntrance } from '../../../lib/hooks';
import { codeBlockSchema, type CodeBlockProps } from './schema';

export { codeBlockSchema, type CodeBlockProps };

type TokenType = 'text' | 'keyword' | 'string' | 'comment' | 'number' | 'tag';

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'await',
  'async', 'type', 'interface', 'of', 'in', 'true', 'false', 'null', 'undefined',
  'this', 'typeof', 'as',
]);

// Deterministic, dependency-free tokenizer. A single ordered regex captures
// comments / strings / numbers / identifiers / other; identifiers matching a
// keyword are colored. Pure — no async, no state, safe for render (§1).
const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`[^`]*`|"[^"]*"|'[^']*')|(\b\d[\d._]*\b)|([A-Za-z_$][\w$]*)|(\s+|[^\s])/g;

function tokenizeLine(line: string): Array<{ text: string; type: TokenType }> {
  const out: Array<{ text: string; type: TokenType }> = [];
  // An identifier directly after `<` or `</` is a JSX/HTML tag name — color it
  // so markup reads with the variety a real editor theme has, not flat white.
  let expectTag = false;
  for (const m of line.matchAll(TOKEN_RE)) {
    if (m[1]) { out.push({ text: m[1], type: 'comment' }); expectTag = false; }
    else if (m[2]) { out.push({ text: m[2], type: 'string' }); expectTag = false; }
    else if (m[3]) { out.push({ text: m[3], type: 'number' }); expectTag = false; }
    else if (m[4]) {
      if (expectTag) out.push({ text: m[4], type: 'tag' });
      else out.push({ text: m[4], type: KEYWORDS.has(m[4]) ? 'keyword' : 'text' });
      expectTag = false;
    } else {
      const t = m[5] ?? '';
      out.push({ text: t, type: 'text' });
      // `<` opens a tag; a following `/` (closing tag) or whitespace keeps the
      // expectation alive; any other punctuation cancels it.
      if (t === '<') expectTag = true;
      else if (t === '/' || /^\s+$/.test(t)) { /* keep expectTag */ }
      else expectTag = false;
    }
  }
  return out;
}

/**
 * Syntax-highlighted code on the Onda glass surface, revealed line-by-line.
 * Highlighting is a deterministic, dependency-free tokenizer (no async, no
 * Shiki at render time) so frame N is reproducible. Keywords carry the one
 * earned accent; everything else stays neutral.
 *
 * @example
 * <CodeBlock code={"export const x = 1;"} title="demo.ts" />
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code, title, chrome, revealLines, delay, lineDelay,
  fontFamily, fontSize, width, textColor, keywordColor, stringColor, commentColor, numberColor, tagColor, placement,
}) => {
  const lines = code.split('\n');
  const lineStyleAt = useStaggeredEntrance({ type: 'rise', delay, increment: lineDelay, distance: 6 });
  const colorFor: Record<TokenType, string> = {
    text: textColor, keyword: keywordColor, string: stringColor, comment: commentColor, number: numberColor, tag: tagColor,
  };

  return (
    <PlacementBox placement={placement}>
      <Surface variant="glass" width={width} padding={0}>
        {chrome && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '18px 24px', borderBottom: '1px solid #1C1C22',
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: 999, background: '#26262E' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: '#26262E' }} />
            <span style={{ width: 18, height: 18, borderRadius: 999, background: '#26262E' }} />
            {title && (
              <span style={{ marginLeft: 10, color: '#56565F', fontFamily, fontSize: fontSize * 0.6, letterSpacing: '0.04em' }}>
                {title}
              </span>
            )}
          </div>
        )}
        <pre style={{ margin: 0, padding: '28px 36px', fontFamily, fontSize, lineHeight: 1.6, textAlign: 'left' }}>
          {lines.map((line, i) => {
            const s = revealLines ? lineStyleAt(i) : { opacity: 1, transform: 'none' };
            return (
              <div key={i} style={{ opacity: s.opacity, transform: s.transform, whiteSpace: 'pre' }}>
                {tokenizeLine(line).map((tok, j) => (
                  <span key={j} style={{ color: colorFor[tok.type] }}>{tok.text}</span>
                ))}
                {line.length === 0 ? '​' : ''}
              </div>
            );
          })}
        </pre>
      </Surface>
    </PlacementBox>
  );
};
