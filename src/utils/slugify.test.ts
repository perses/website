import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from './slugify';

describe('slugify', () => {
  it('follows the python-markdown algorithm', () => {
    expect(slugify('Release v0.55.0')).toBe('release-v0550');
    expect(slugify('Datasource & Variable scopes')).toBe('datasource-variable-scopes');
    expect(slugify('  Héllo   World!  ')).toBe('hello-world');
    expect(slugify('Release notes')).toBe('release-notes');
  });
});

describe('uniqueSlug', () => {
  it('suffixes the duplicated slugs', () => {
    const used = new Set<string>();
    expect(['usage', 'usage', 'usage', ''].map((slug) => uniqueSlug(slug, used))).toEqual([
      'usage',
      'usage_1',
      'usage_2',
      '_1',
    ]);
  });
});
