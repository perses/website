// Copyright The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { Element, Root as HastRoot, RootContent } from 'hast';
import { toString } from 'hast-util-to-string';
import type { Root as MdastRoot } from 'mdast';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { createHighlighter, type HighlighterGeneric } from 'shiki';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { parse as parseYaml } from 'yaml';
import type { MarkdownContent } from '../types.ts';
import { convertMkdocsAdmonitions, remarkAdmonitions } from './admonitions.server.ts';
import { type HeadingsResult, rehypeHeadings } from './headings.server.ts';
import { rehypeRewriteUrls, type UrlResolver } from './links.server.ts';

const languages = [
  'yaml',
  'go',
  'shellscript',
  'shellsession',
  'cue',
  'json',
  'jsonc',
  'json5',
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'docker',
  'html',
  'css',
  'markdown',
  'diff',
  'toml',
  'ini',
  'sql',
  'python',
  'jsonnet',
  'hcl',
  'nginx',
  'xml',
  'http',
  'make',
] as const;

export const shikiThemes = { light: 'github-light', dark: 'github-dark' } as const;

// oxlint-disable-next-line typescript/no-explicit-any
let highlighterPromise: Promise<HighlighterGeneric<any, any>> | undefined;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: Object.values(shikiThemes),
    langs: [...languages],
    langAlias: { golang: 'go', promql: 'text', tree: 'text', ppl: 'sql', gotmpl: 'go' },
  });
  return highlighterPromise;
}

const frontmatterRegexp = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

export function extractFrontmatter(markdown: string): { data: Record<string, unknown>; body: string } {
  const match = frontmatterRegexp.exec(markdown);
  if (!match) {
    return { data: {}, body: markdown };
  }
  const data: unknown = parseYaml(match[1] ?? '');
  return {
    data: data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : {},
    body: markdown.slice(match[0].length),
  };
}

/**
 * stripInlineFormatting removes the backticks and the emphasis markers (`*text*`, `**text**`, `_text_`) of a line of
 * markdown. The other `*` and `_` characters (`snake_case`) and the content of the inline code (`__name__`) are kept.
 */
export function stripInlineFormatting(text: string): string {
  return text
    .split(/(`[^`]*`)/)
    .map((part, index) =>
      index % 2 === 1
        ? part.slice(1, -1)
        : part
            .replace(/`/g, '')
            .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '$2')
            .replace(/(?<![\w*])\*(?=\S)(.+?)(?<=\S)\*(?![\w*])/g, '$1')
            .replace(/(?<!\w)_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '$1'),
    )
    .join('');
}

/**
 * markdownTitle returns the title of a markdown document without rendering it: the `title` of its front matter, or
 * its first h1 (ATX `# Title` or setext `Title` followed by `===`), without the inline formatting characters.
 */
export function markdownTitle(markdown: string): string | undefined {
  const { data, body } = extractFrontmatter(markdown);
  if (typeof data.title === 'string') {
    return data.title;
  }
  const lines = body.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    const atx = /^#\s+(.+?)\s*#*\s*$/.exec(line)?.[1];
    const setext = line.trim() !== '' && /^=+\s*$/.test(lines[i + 1] ?? '') ? line.trim() : undefined;
    const title = atx ?? setext;
    if (title !== undefined) {
      return stripInlineFormatting(title);
    }
  }
  return undefined;
}

/**
 * rehypeMermaid replaces the mermaid code blocks with a `pre.mermaid` element, rendered on the client side.
 */
function rehypeMermaid(result: { hasMermaid: boolean }) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || parent === undefined || index === undefined) {
        return;
      }
      const [code] = node.children;
      if (code?.type !== 'element' || code.tagName !== 'code') {
        return;
      }
      const classes = code.properties.className;
      if (!Array.isArray(classes) || !classes.includes('language-mermaid')) {
        return;
      }
      result.hasMermaid = true;
      parent.children[index] = {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: toString(code) }],
      };
    });
  };
}

/**
 * rehypeCleanup removes the positional information to reduce the size of the serialized tree, inlines the root
 * nodes inserted by Shiki in place of the code blocks and marks the images inside a link.
 */
function rehypeCleanup() {
  return (tree: HastRoot) => {
    const flatten = (node: HastRoot | Element) => {
      // Shiki returns a root node, which is not a valid child type for hast but is inserted as is in the tree.
      const children = node.children as (typeof node.children[number] | HastRoot)[];
      node.children = children.flatMap((child) => (child.type === 'root' ? child.children : [child])) as typeof node.children;
      for (const child of node.children) {
        if (child.type === 'element') {
          flatten(child);
        }
      }
    };
    flatten(tree);
    visit(tree, (node) => {
      delete node.position;
    });
    // The images inside a link are not enlarged on click: they can't be rendered as a button inside the link.
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a') {
        visit(node, 'element', (child: Element) => {
          if (child.tagName === 'img') {
            child.properties.dataInLink = 'true';
          }
        });
      }
    });
  };
}

export interface RenderOptions {
  resolveUrl?: UrlResolver;
  /** Remove the first h1 of the document, when the title is displayed separately. */
  removeTitle?: boolean;
}

export interface RenderedMarkdown extends MarkdownContent {
  frontmatter: Record<string, unknown>;
  /** Content located before the `<!-- more -->` marker, if any. */
  excerpt?: HastRoot;
  /** Plain text of the document, used to estimate the reading time. */
  text: string;
}

function isMoreMarker(node: RootContent): boolean {
  return node.type === 'comment' && node.value.trim() === 'more';
}

function removeFirstH1(tree: HastRoot) {
  const index = tree.children.findIndex((node) => node.type === 'element' && node.tagName === 'h1');
  if (index !== -1) {
    tree.children.splice(index, 1);
  }
}

export async function renderMarkdown(markdown: string, options: RenderOptions = {}): Promise<RenderedMarkdown> {
  const { data, body } = extractFrontmatter(markdown);
  const headings: HeadingsResult = { toc: [] };
  const mermaid = { hasMermaid: false };
  const highlighter = await getHighlighter();

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAdmonitions)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHeadings, headings)
    .use(rehypeMermaid, mermaid)
    .use(rehypeShikiFromHighlighter, highlighter, {
      themes: shikiThemes,
      defaultColor: false,
      fallbackLanguage: 'text',
      defaultLanguage: 'text',
      addLanguageClass: true,
    })
    .use(rehypeCleanup);
  if (options.resolveUrl) {
    processor.use(rehypeRewriteUrls, options.resolveUrl);
  }

  const mdast = processor.parse(convertMkdocsAdmonitions(body)) as MdastRoot;
  const hast = (await processor.run(mdast)) as HastRoot;

  if (options.removeTitle) {
    removeFirstH1(hast);
  }

  const moreIndex = hast.children.findIndex(isMoreMarker);
  const excerpt: HastRoot | undefined =
    moreIndex === -1 ? undefined : { type: 'root', children: hast.children.slice(0, moreIndex) };

  const title = typeof data.title === 'string' ? data.title : (headings.title ?? '');
  return {
    frontmatter: data,
    title,
    toc: headings.toc,
    hast,
    excerpt,
    hasMermaid: mermaid.hasMermaid,
    text: toString(hast),
  };
}
