// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { NavNode } from '../../content/types';
import { NavTree } from './NavTree';

const nav: NavNode[] = [
  {
    title: 'Concepts',
    children: [
      { title: 'Dashboard', href: '/docs/perses/latest/concepts/dashboard/' },
      { title: 'Variable', href: '/docs/perses/latest/concepts/variable/' },
    ],
  },
];

function Harness() {
  const [pathname, setPathname] = useState('/docs/perses/latest/concepts/dashboard/');
  return (
    <>
      <button type="button" onClick={() => setPathname('/docs/perses/latest/concepts/variable/')}>
        next page
      </button>
      <NavTree nodes={nav} pathname={pathname} />
    </>
  );
}

const section = () => screen.getByRole('button', { name: 'Concepts' });

describe('NavTree', () => {
  it('expands again the section of the current page after a navigation, even if it was collapsed', () => {
    const Stub = createRoutesStub([{ path: '*', Component: Harness }]);
    render(<Stub />);
    expect(section().getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(section());
    expect(section().getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'next page' }));
    expect(section().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('link', { name: 'Variable' }).getAttribute('aria-current')).toBe('page');
  });
});
