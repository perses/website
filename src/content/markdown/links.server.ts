import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export type UrlKind = 'link' | 'asset';

/**
 * UrlResolver rewrites a URL found in a markdown document. It returns undefined to leave the URL untouched.
 */
export type UrlResolver = (url: string, kind: UrlKind) => string | undefined;

const urlAttributes: Record<string, { property: string; kind: UrlKind }[]> = {
  a: [{ property: 'href', kind: 'link' }],
  img: [{ property: 'src', kind: 'asset' }],
  source: [{ property: 'src', kind: 'asset' }],
  video: [
    { property: 'src', kind: 'asset' },
    { property: 'poster', kind: 'asset' },
  ],
};

export function rehypeRewriteUrls(resolve: UrlResolver) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const attributes = urlAttributes[node.tagName];
      if (attributes === undefined) {
        return;
      }
      for (const { property, kind } of attributes) {
        const value = node.properties[property];
        if (typeof value !== 'string' || value === '') {
          continue;
        }
        const rewritten = resolve(value, kind);
        if (rewritten !== undefined) {
          node.properties[property] = rewritten;
        }
      }
    });
  };
}

export function isExternalUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
}

/**
 * splitUrl separates the path from the query string and the hash.
 */
export function splitUrl(url: string): { path: string; suffix: string } {
  const index = url.search(/[?#]/);
  return index === -1 ? { path: url, suffix: '' } : { path: url.slice(0, index), suffix: url.slice(index) };
}
