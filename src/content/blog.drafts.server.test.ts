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
