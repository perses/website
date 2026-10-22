import { describe, expect, it } from 'vitest';
import { activeMenuHref } from './AppHeader';

describe('activeMenuHref', () => {
  const menu = [
    { title: 'Docs', href: '/docs/' },
    { title: 'Plugins', href: '/docs/plugins/' },
    { title: 'Blog', href: '/blog/' },
    { title: 'Demo', href: 'https://demo.perses.dev' },
  ];

  it('selects the most specific entry', () => {
    expect(activeMenuHref(menu, '/docs/perses/latest/overview/')).toBe('/docs/');
    expect(activeMenuHref(menu, '/docs/plugins/tempo/')).toBe('/docs/plugins/');
    expect(activeMenuHref(menu, '/blog/2026/10/21/release-v0550/')).toBe('/blog/');
    expect(activeMenuHref(menu, '/')).toBeUndefined();
  });
});
