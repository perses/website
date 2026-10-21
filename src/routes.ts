import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('blog/rss.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'blog-feed' }),
  route('blog/category/:category/rss.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'blog-category-feed' }),
  // URL of the RSS feed of the previous website, kept for the existing subscribers.
  route('feed_rss_created.xml', 'resources/BlogFeed/BlogFeed.ts', { id: 'legacy-blog-feed' }),
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
