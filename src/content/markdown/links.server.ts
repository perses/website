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

import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export type UrlKind = 'link' | 'asset';

/**
 * UrlResolver rewrites a URL found in a markdown document. It returns undefined to leave the URL untouched.
 */
export type UrlResolver = (url: string, kind: UrlKind) => string | undefined;

const urlAttributes: Record<string, { property: string; kind: UrlKind }[]> = {
  a: [{ property: 'href', kind: 'link' }],
  img: [{ property: 'src', kind: 'asset' }],
  source: [{ property: 'src', kind: 'asset' }],
  video: [
    { property: 'src', kind: 'asset' },
    { property: 'poster', kind: 'asset' },
  ],
};

export function rehypeRewriteUrls(resolve: UrlResolver) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const attributes = urlAttributes[node.tagName];
      if (attributes === undefined) {
        return;
      }
      for (const { property, kind } of attributes) {
        const value = node.properties[property];
        if (typeof value !== 'string' || value === '') {
          continue;
        }
        const rewritten = resolve(value, kind);
        if (rewritten !== undefined) {
          node.properties[property] = rewritten;
        }
      }
    });
  };
}

export function isExternalUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
}

/**
 * splitUrl separates the path from the query string and the hash.
 */
export function splitUrl(url: string): { path: string; suffix: string } {
  const index = url.search(/[?#]/);
  return index === -1 ? { path: url, suffix: '' } : { path: url.slice(0, index), suffix: url.slice(index) };
}
