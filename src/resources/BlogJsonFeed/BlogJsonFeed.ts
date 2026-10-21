import { generateJsonFeed } from '../../content/rss.server';
import type { Route } from './+types/BlogJsonFeed';

/**
 * JSON feed of the blog (`/blog/feed.json`), also served at the URLs of the JSON feeds of the previous website.
 */
export async function loader({ url }: Route.LoaderArgs) {
  const feed = await generateJsonFeed(url.pathname);
  return new Response(feed, { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } });
}
