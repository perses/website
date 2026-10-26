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

import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadPosts } from './blog.server';

describe('loadPosts', () => {
  const root = mkdtempSync(join(tmpdir(), 'perses-website-'));

  beforeAll(() => {
    cpSync(join(process.cwd(), 'website.yaml'), join(root, 'website.yaml'));
    mkdirSync(join(root, 'content', 'blog', 'posts'), { recursive: true });
    writeFileSync(join(root, 'content', 'blog', 'posts', 'published.md'), '---\ndate: 2026-10-21\n---\n# Published post\n');
    // An unfinished draft, without date nor title.
    writeFileSync(join(root, 'content', 'blog', 'posts', 'draft.md'), '---\ndraft: true\n---\nWork in progress\n');
    process.env.WEBSITE_ROOT = root;
  });

  afterAll(() => {
    delete process.env.WEBSITE_ROOT;
    rmSync(root, { recursive: true, force: true });
  });

  it('skips the drafts outside of the dev server, even when they are incomplete', async () => {
    const posts = await loadPosts();
    expect(posts.map((post) => post.url)).toEqual(['/blog/2026/10/21/published-post/']);
  });
});
