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
