import { describe, expect, it } from 'vitest';
import { buildArchive, createBlogUrlResolver } from './blog.server';

const post = (title: string, date: string) => ({ title, date, url: `/blog/${title}/` });

describe('buildArchive', () => {
  it('groups the posts by year, keeping their order', () => {
    expect(buildArchive([post('c', '2026-10-21'), post('b', '2026-01-31'), post('a', '2025-06-10')])).toEqual([
      { year: '2026', posts: [post('c', '2026-10-21'), post('b', '2026-01-31')] },
      { year: '2025', posts: [post('a', '2025-06-10')] },
    ]);
  });
});

describe('createBlogUrlResolver', () => {
  const resolve = createBlogUrlResolver(new Map([['v0.54.0.md', '/blog/2026/07/29/release-v0540/']]));

  it('resolves the links as if the posts were still in docs/blog/posts of the mkdocs website', () => {
    expect(resolve('../../adopters.md', 'link')).toBe('/adopters/');
    expect(resolve('../../assets/images/blog/v055/canvas.png', 'asset')).toBe('/assets/images/blog/v055/canvas.png');
  });

  it('targets the URL of the other posts', () => {
    expect(resolve('./v0.54.0.md#plugins', 'link')).toBe('/blog/2026/07/29/release-v0540/#plugins');
  });

  it('maps the links to the documentation of the previous website', () => {
    expect(resolve('../../perses/docs/concepts/dashboard.md', 'link')).toBe('/docs/perses/latest/concepts/dashboard/');
    expect(resolve('https://perses.dev/plugins/docs/tempo/', 'link')).toBe('/docs/plugins/tempo/');
  });

  it('leaves the anchors and the external links untouched', () => {
    expect(resolve('#security', 'link')).toBeUndefined();
    expect(resolve('https://github.com/perses/perses', 'link')).toBeUndefined();
  });
});
