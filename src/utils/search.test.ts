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
