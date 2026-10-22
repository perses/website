import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contentDir } from './config.server.ts';
import { mapLegacyUrl } from './legacy.server.ts';
import { renderMarkdown } from './markdown/render.server.ts';
import type { MarkdownContent } from './types.ts';

/**
 * loadPage renders a markdown page of the website from `content/pages/`.
 */
export async function loadPage(name: string): Promise<MarkdownContent> {
  const rendered = await renderMarkdown(readFileSync(join(contentDir(), 'pages', `${name}.md`), 'utf8'), {
    resolveUrl: (url) => mapLegacyUrl(url),
  });
  return { title: rendered.title, toc: rendered.toc, hast: rendered.hast, hasMermaid: rendered.hasMermaid };
}
