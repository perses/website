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
