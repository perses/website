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

export const LATEST = 'latest';

function joinSegments(...segments: (string | undefined)[]): string {
  const path = segments
    .filter((s): s is string => s !== undefined && s !== '')
    .map((s) => s.replace(/^\/+|\/+$/g, ''))
    .filter((s) => s !== '')
    .join('/');
  return path === '' ? '/' : `/${path}/`;
}

/**
 * docsUrl returns the URL of a documentation page. `version` is undefined for not versioned sources.
 */
export function docsUrl(source: string, version: string | undefined, slug = ''): string {
  return joinSegments('docs', source, version, slug);
}

export function blogUrl(page = 1): string {
  return page <= 1 ? '/blog/' : joinSegments('blog', 'page', String(page));
}

export function blogPostUrl(date: string, slug: string): string {
  const [year, month, day] = date.slice(0, 10).split('-');
  return joinSegments('blog', year, month, day, slug);
}

export function blogCategoryUrl(category: string, page = 1): string {
  return page <= 1 ? joinSegments('blog', 'category', category) : joinSegments('blog', 'category', category, 'page', String(page));
}

export function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}
