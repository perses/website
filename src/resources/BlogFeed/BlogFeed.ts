import { data } from 'react-router';
import { generateFeed } from '../../content/rss.server';
import type { Route } from './+types/BlogFeed';

/**
 * RSS feed of the blog (`/blog/rss.xml`), of a category (`/blog/category/<category>/rss.xml`) and the URL of the feed
 * of the previous website (`/feed_rss_created.xml`).
 */
export async function loader({ params }: Route.LoaderArgs) {
  const feed = await generateFeed('category' in params ? params.category : undefined);
  if (feed === undefined) {
    throw data(null, { status: 404 });
  }
  return new Response(feed, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
