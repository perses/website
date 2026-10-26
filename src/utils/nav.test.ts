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

import { describe, expect, it } from 'vitest';
import type { NavNode } from '../content/types';
import { findTrail, siblings } from './nav';

const nav: NavNode[] = [
  { title: 'Overview', href: '/docs/perses/latest/overview/' },
  {
    title: 'Concepts',
    children: [
      { title: 'Dashboard', href: '/docs/perses/latest/concepts/dashboard/' },
      { title: 'Plugins', href: '/docs/plugins/' },
      { title: 'Variable', href: '/docs/perses/latest/concepts/variable/' },
    ],
  },
  { title: 'Demo', href: 'https://demo.perses.dev', external: true },
];

describe('nav utils', () => {
  it('finds the trail of the current page', () => {
    expect(findTrail(nav, '/docs/perses/latest/concepts/dashboard/').map((n) => n.title)).toEqual(['Concepts', 'Dashboard']);
    expect(findTrail(nav, '/unknown/')).toEqual([]);
  });

  it('finds the previous and next pages of the same source', () => {
    const { previous, next } = siblings(nav, '/docs/perses/latest/concepts/dashboard', '/docs/perses/latest/');
    expect(previous?.title).toBe('Overview');
    expect(next?.title).toBe('Variable');
  });
});
