import { describe, expect, it } from 'vitest';
import { blogCategoryUrl, blogPostUrl, blogUrl, docsUrl, isExternalHref } from './urls';

describe('urls', () => {
  it('builds the documentation URLs', () => {
    expect(docsUrl('perses', 'latest', 'concepts/dashboard')).toBe('/docs/perses/latest/concepts/dashboard/');
    expect(docsUrl('plugins', undefined, '')).toBe('/docs/plugins/');
  });

  it('builds the blog URLs', () => {
    expect(blogUrl()).toBe('/blog/');
    expect(blogUrl(2)).toBe('/blog/page/2/');
    expect(blogPostUrl('2026-10-21', 'release-v0550')).toBe('/blog/2026/10/21/release-v0550/');
    expect(blogCategoryUrl('community', 3)).toBe('/blog/category/community/page/3/');
  });

  it('detects the external links', () => {
    expect(isExternalHref('https://perses.dev')).toBe(true);
    expect(isExternalHref('mailto:someone@example.com')).toBe(true);
    expect(isExternalHref('/docs/')).toBe(false);
  });
});
