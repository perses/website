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
import { collectPages, generateNav, parseNav } from './nav.server';

describe('parseNav', () => {
  it('parses pages, sections, cross-source pages and links', () => {
    const nav = parseNav(
      `
- overview.md
- Getting started: getting-started.md
- Concepts:
    - Dashboard: concepts/dashboard.md
- Helm: helm-charts:installation.md
- Plugins: /docs/plugins/
- Demo: https://demo.perses.dev
`,
      ['perses', 'helm-charts'],
    );
    expect(nav).toEqual([
      { kind: 'page', title: undefined, path: 'overview.md' },
      { kind: 'page', title: 'Getting started', path: 'getting-started.md' },
      { kind: 'section', title: 'Concepts', children: [{ kind: 'page', title: 'Dashboard', path: 'concepts/dashboard.md' }] },
      { kind: 'page', title: 'Helm', source: 'helm-charts', path: 'installation.md' },
      { kind: 'link', title: 'Plugins', href: '/docs/plugins/' },
      { kind: 'link', title: 'Demo', href: 'https://demo.perses.dev' },
    ]);
  });

  it('treats an unknown prefix as a path', () => {
    expect(parseNav('- unknown:page.md', ['perses'])).toEqual([{ kind: 'page', title: undefined, path: 'unknown:page.md' }]);
  });

  it('rejects invalid entries', () => {
    expect(() => parseNav('- a: b.md\n  c: d.md', [])).toThrow(/exactly one key/);
    expect(() => parseNav('title: value', [])).toThrow(/expected a list/);
  });
});

describe('collectPages', () => {
  it('returns the pages of the current source', () => {
    const nav = parseNav('- a.md\n- S:\n    - b.md\n    - plugins:c.md', ['plugins']);
    expect(collectPages(nav)).toEqual(['a.md', 'b.md']);
    expect(collectPages(nav, 'plugins')).toEqual(['c.md']);
  });
});

describe('generateNav', () => {
  it('builds a navigation from the files, with the README first', () => {
    expect(generateNav(['b.md', 'README.md', 'api/user.md', 'api/README.md'])).toEqual([
      { kind: 'page', path: 'README.md' },
      { kind: 'page', path: 'b.md' },
      {
        kind: 'section',
        title: 'Api',
        children: [
          { kind: 'page', path: 'api/README.md' },
          { kind: 'page', path: 'api/user.md' },
        ],
      },
    ]);
  });
});
