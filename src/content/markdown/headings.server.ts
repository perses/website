import type { Element, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';
import { slugify, uniqueSlug } from '../../utils/slugify.ts';
import type { TocItem } from '../types.ts';

const headingTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export interface HeadingsResult {
  title?: string;
  toc: TocItem[];
}

function explicitId(node: Element): string | undefined {
  const id = node.properties.id;
  return typeof id === 'string' && id !== '' ? id : undefined;
}

/**
 * rehypeHeadings sets an id on every heading (using the python-markdown algorithm), collects the table of contents
 * (h2 and h3) and the text of the first h1. The ids written in the document are kept, and reserved before generating
 * the other ones so they are never duplicated.
 */
export function rehypeHeadings(result: HeadingsResult) {
  return (tree: Root) => {
    const used = new Set<string>();
    visit(tree, 'element', (node: Element) => {
      const id = explicitId(node);
      if (id !== undefined) {
        used.add(id);
      }
    });
    visit(tree, 'element', (node: Element) => {
      if (!headingTags.has(node.tagName)) {
        return;
      }
      const text = toString(node).trim();
      const id = explicitId(node) ?? uniqueSlug(slugify(text), used);
      node.properties.id = id;
      if (node.tagName === 'h1') {
        result.title ??= text;
        return;
      }
      if (node.tagName === 'h2' || node.tagName === 'h3') {
        result.toc.push({ id, title: text, depth: node.tagName === 'h2' ? 2 : 3 });
      }
    });
  };
}
