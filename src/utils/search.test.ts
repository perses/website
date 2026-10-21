import { describe, expect, it } from 'vitest';
import { searchScope } from './search';

describe('searchScope', () => {
  it('searches the latest content by default', () => {
    expect(searchScope('/blog/')).toEqual({ filters: { scope: 'latest' } });
    expect(searchScope('/docs/perses/latest/overview/')).toEqual({ filters: { scope: 'latest' } });
  });

  it('searches the browsed version of a source', () => {
    expect(searchScope('/docs/perses/v0.53/overview/')).toEqual({
      label: 'perses v0.53',
      filters: { any: [{ scope: 'perses@v0.53' }, { scope: 'latest', not: { source: 'perses' } }] },
    });
  });
});
