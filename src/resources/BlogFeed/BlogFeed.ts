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
