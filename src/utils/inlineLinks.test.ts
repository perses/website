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
