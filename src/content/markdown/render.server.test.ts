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

import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import { extractFrontmatter, markdownTitle, renderMarkdown, stripInlineFormatting } from './render.server';

function findElements(tree: Root, tagName: string): Element[] {
  const found: Element[] = [];
  const visit = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type === 'element') {
        if (child.tagName === tagName) {
          found.push(child);
        }
        visit(child);
      }
    }
  };
  visit(tree);
  return found;
}

describe('extractFrontmatter', () => {
  it('extracts the YAML front matter', () => {
    expect(extractFrontmatter('---\ndate: 2026-10-21\ncategories:\n  - Release notes\n---\n# Title\n')).toEqual({
      data: { date: '2026-10-21', categories: ['Release notes'] },
      body: '# Title\n',
    });
  });

  it('returns the document as is without front matter', () => {
    expect(extractFrontmatter('# Title')).toEqual({ data: {}, body: '# Title' });
  });
});

describe('renderMarkdown', () => {
  it('generates the heading ids like python-markdown and collects the table of contents', async () => {
    const result = await renderMarkdown('# Title\n\n## Datasource & Variable scopes\n\n### Usage\n\n### Usage\n');
    expect(result.title).toBe('Title');
    expect(result.toc).toEqual([
      { id: 'datasource-variable-scopes', title: 'Datasource & Variable scopes', depth: 2 },
      { id: 'usage', title: 'Usage', depth: 3 },
      { id: 'usage_1', title: 'Usage', depth: 3 },
    ]);
  });

  it('keeps the ids written in the document and never duplicates them', async () => {
    const result = await renderMarkdown('## Usage\n\n<h2 id="usage">Explicit</h2>\n\n## Usage\n');
    expect(result.toc.map((item) => item.id)).toEqual(['usage_1', 'usage', 'usage_2']);
  });

  it('renders both admonition syntaxes', async () => {
    const result = await renderMarkdown('!!! warning "Be careful"\n    Text\n\n> [!TIP]\n> GitHub syntax\n');
    const asides = findElements(result.hast, 'aside');
    expect(asides.map((aside) => aside.properties)).toEqual([
      expect.objectContaining({ dataSeverity: 'warning', dataTitle: 'Be careful' }),
      expect.objectContaining({ dataSeverity: 'success', dataTitle: 'Tip' }),
    ]);
  });

  it('highlights the code blocks and keeps the mermaid diagrams for the client', async () => {
    const result = await renderMarkdown('```golang\nfunc main() {}\n```\n\n```mermaid\ngraph TD; A-->B\n```\n');
    const pres = findElements(result.hast, 'pre');
    expect(String(pres[0]?.properties.className ?? pres[0]?.properties.class)).toContain('shiki');
    expect(pres[1]?.properties.className).toEqual(['mermaid']);
    expect(result.hasMermaid).toBe(true);
  });

  it('ignores the case of the language of the code blocks, like GitHub', async () => {
    const mixedCase = await renderMarkdown('```typeScript\nconst a = 1;\n```\n');
    const lowerCase = await renderMarkdown('```typescript\nconst a = 1;\n```\n');
    expect(mixedCase.hast).toEqual(lowerCase.hast);
    expect(findElements(mixedCase.hast, 'code')[0]?.properties.class).toEqual(['language-typescript']);
  });

  it('rewrites the URLs with the resolver', async () => {
    const result = await renderMarkdown('[page](./other.md#anchor) ![image](img.png) [external](https://example.com)', {
      resolveUrl: (url, kind) => (url.startsWith('http') ? undefined : `/resolved/${kind}/${url}`),
    });
    expect(findElements(result.hast, 'a').map((a) => a.properties.href)).toEqual([
      '/resolved/link/./other.md#anchor',
      'https://example.com',
    ]);
    expect(findElements(result.hast, 'img')[0]?.properties.src).toBe('/resolved/asset/img.png');
  });

  it('extracts the excerpt before the more marker and removes the title', async () => {
    const result = await renderMarkdown('# Post\n\nIntro\n\n<!-- more -->\n\nRest', { removeTitle: true });
    expect(findElements(result.hast, 'h1')).toHaveLength(0);
    expect(result.excerpt?.children.filter((node) => node.type === 'element')).toHaveLength(1);
    expect(result.title).toBe('Post');
  });

  it('prefers the title of the front matter', async () => {
    expect((await renderMarkdown('---\ntitle: From front matter\n---\n# Heading')).title).toBe('From front matter');
  });
});

describe('markdownTitle', () => {
  it('returns the title of the front matter, the first ATX or setext h1', () => {
    expect(markdownTitle('---\ntitle: Front\n---\n# Heading')).toBe('Front');
    expect(markdownTitle('```\n# not a title\n```\n# Release v0.55.0')).toBe('Release v0.55.0');
    expect(markdownTitle('Adopters Logo\n=============\n')).toBe('Adopters Logo');
    expect(markdownTitle('No title')).toBeUndefined();
  });
});

describe('stripInlineFormatting', () => {
  it('removes the inline code and emphasis markers only', () => {
    expect(stripInlineFormatting('The `perses_config` file')).toBe('The perses_config file');
    expect(stripInlineFormatting('A **bold** and *italic* or _italic_ title')).toBe('A bold and italic or italic title');
    expect(stripInlineFormatting('snake_case_name and 2 * 3 * 4')).toBe('snake_case_name and 2 * 3 * 4');
  });

  it('keeps the content of the inline code', () => {
    expect(stripInlineFormatting('The `__name__` label')).toBe('The __name__ label');
    expect(stripInlineFormatting('Glob `**/*.md` files with **care**')).toBe('Glob **/*.md files with care');
  });
});
