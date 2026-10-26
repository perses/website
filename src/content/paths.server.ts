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

import { listBlogPaths, loadPosts } from './blog.server.ts';
import { listCanonicalDocsPaths, listDocsPaths, reportNavigationIssues } from './docs.server.ts';

const staticPaths = ['/', '/download/', '/download/plugins/', '/adopters/', '/404/'];

/**
 * listAllPaths returns every URL prerendered at build time.
 */
export async function listAllPaths(): Promise<string[]> {
  reportNavigationIssues();
  return [...new Set([...staticPaths, ...listDocsPaths(), ...(await listBlogPaths()), '/sitemap.xml'])];
}

/**
 * listSitemapEntries returns the canonical URLs of the website, with the last modification date when known.
 */
export async function listSitemapEntries(): Promise<{ path: string; lastmod?: string }[]> {
  const posts = await loadPosts();
  return [
    ...staticPaths.filter((path) => path !== '/404/').map((path) => ({ path })),
    { path: '/docs/' },
    ...listCanonicalDocsPaths().map((path) => ({ path })),
    { path: '/blog/', lastmod: posts[0]?.date },
    ...posts.map((post) => ({ path: post.url, lastmod: post.date })),
  ];
}
