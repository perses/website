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

import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('blog/rss.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'blog-feed' }),
  route('blog/category/:category/rss.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'blog-category-feed' }),
  route('blog/feed.json', 'resources/BlogJsonFeed/BlogJsonFeed.ts', { id: 'blog-json-feed' }),
  // URLs of the feeds of the previous website, kept for the existing subscribers.
  route('feed_rss_created.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'legacy-blog-feed-created' }),
  route('feed_rss_updated.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'legacy-blog-feed-updated' }),
  route('feed_json_created.json', 'resources/BlogJsonFeed/BlogJsonFeed.ts', { id: 'legacy-blog-json-feed-created' }),
  route('feed_json_updated.json', 'resources/BlogJsonFeed/BlogJsonFeed.ts', { id: 'legacy-blog-json-feed-updated' }),
  route('sitemap.xml', 'resources/Sitemap/Sitemap.ts'),
  layout('pages/Layout/Layout.tsx', [
    index('pages/Home/Home.tsx'),
    route('docs', 'pages/DocsIndex/DocsIndex.tsx'),
    route('docs/:source/*', 'pages/DocsPage/DocsPage.tsx'),
    // With prerendering, every route having a loader must have at least one prerendered page: the pagination is an
    // optional segment of the list routes so it doesn't need a route of its own.
    route('blog/page?/:page?', 'pages/Blog/Blog.tsx', { id: 'blog' }),
    route('blog/category/:category/page?/:page?', 'pages/Blog/Blog.tsx', { id: 'blog-category' }),
    route('blog/:year/:month/:day/:slug', 'pages/BlogPost/BlogPost.tsx'),
    route('download', 'pages/Download/Download.tsx'),
    route('download/plugins', 'pages/DownloadPlugins/DownloadPlugins.tsx'),
    route('adopters', 'pages/Adopters/Adopters.tsx'),
    // Redirections from the URLs of the previous website, and the "not found" page.
    route('*', 'pages/CatchAll/CatchAll.tsx'),
  ]),
] satisfies RouteConfig;
