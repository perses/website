export type InlineToken = { type: 'text'; value: string } | { type: 'link'; label: string; href: string };

/**
 * parseInlineLinks splits a text containing markdown links (`[label](href)`) into tokens. It is used for short texts
 * defined in the configuration, which don't need a full markdown renderer.
 */
export function parseInlineLinks(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regexp = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(regexp)) {
    if (match.index > last) {
      tokens.push({ type: 'text', value: text.slice(last, match.index) });
    }
    tokens.push({ type: 'link', label: match[1] ?? '', href: match[2] ?? '' });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    tokens.push({ type: 'text', value: text.slice(last) });
  }
  return tokens;
}
