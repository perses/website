import { describe, expect, it } from 'vitest';
import { parseInlineLinks } from './inlineLinks';

describe('parseInlineLinks', () => {
  it('splits the text and the links', () => {
    expect(parseInlineLinks('For a list, see [Trademark Usage](https://example.com/t).')).toEqual([
      { type: 'text', value: 'For a list, see ' },
      { type: 'link', label: 'Trademark Usage', href: 'https://example.com/t' },
      { type: 'text', value: '.' },
    ]);
  });
});
