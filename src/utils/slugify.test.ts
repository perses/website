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
