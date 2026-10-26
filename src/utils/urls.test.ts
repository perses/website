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
import { blogCategoryUrl, blogPostUrl, blogUrl, docsUrl, isExternalHref } from './urls';

describe('urls', () => {
  it('builds the documentation URLs', () => {
    expect(docsUrl('perses', 'latest', 'concepts/dashboard')).toBe('/docs/perses/latest/concepts/dashboard/');
    expect(docsUrl('plugins', undefined, '')).toBe('/docs/plugins/');
  });

  it('builds the blog URLs', () => {
    expect(blogUrl()).toBe('/blog/');
    expect(blogUrl(2)).toBe('/blog/page/2/');
    expect(blogPostUrl('2026-10-21', 'release-v0550')).toBe('/blog/2026/10/21/release-v0550/');
    expect(blogCategoryUrl('community', 3)).toBe('/blog/category/community/page/3/');
  });

  it('detects the external links', () => {
    expect(isExternalHref('https://perses.dev')).toBe(true);
    expect(isExternalHref('mailto:someone@example.com')).toBe(true);
    expect(isExternalHref('/docs/')).toBe(false);
  });
});
