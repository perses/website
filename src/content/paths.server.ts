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
