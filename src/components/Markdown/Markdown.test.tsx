// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import type { Root } from 'hast';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown';

const hast: Root = {
  type: 'root',
  children: [
    { type: 'element', tagName: 'h2', properties: { id: 'usage' }, children: [{ type: 'text', value: 'Usage' }] },
    {
      type: 'element',
      tagName: 'p',
      properties: {},
      children: [
        { type: 'element', tagName: 'a', properties: { href: '/docs/perses/latest/cli/' }, children: [{ type: 'text', value: 'internal' }] },
        { type: 'text', value: ' and ' },
        { type: 'element', tagName: 'a', properties: { href: 'https://github.com' }, children: [{ type: 'text', value: 'external' }] },
      ],
    },
    {
      type: 'element',
      tagName: 'aside',
      properties: { className: ['admonition'], dataSeverity: 'warning', dataTitle: 'Be careful' },
      children: [{ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: 'Content' }] }],
    },
  ],
};

function renderMarkdown() {
  const Stub = createRoutesStub([{ path: '/', Component: () => <Markdown hast={hast} /> }]);
  return render(<Stub />);
}

describe('Markdown', () => {
  it('renders the headings with an anchor', () => {
    renderMarkdown();
    expect(screen.getByRole('heading', { name: /Usage/ })).toHaveProperty('id', 'usage');
    expect(screen.getByRole('link', { name: 'Link to this section' }).getAttribute('href')).toBe('#usage');
  });

  it('opens the external links in a new tab', () => {
    renderMarkdown();
    expect(screen.getByRole('link', { name: 'internal' }).getAttribute('target')).toBeNull();
    expect(screen.getByRole('link', { name: 'external' }).getAttribute('target')).toBe('_blank');
  });

  it('renders the admonitions', () => {
    renderMarkdown();
    expect(screen.getByRole('alert').textContent).toContain('Be careful');
    expect(screen.getByRole('alert').textContent).toContain('Content');
  });
});
