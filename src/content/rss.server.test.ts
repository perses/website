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
import { generateFeed, generateJsonFeed } from './rss.server';

// The feeds are generated from the blog posts of the repository.
describe('feeds', () => {
  it('generates the RSS feed with the post URLs as guid, like the previous website', async () => {
    const feed = await generateFeed();
    expect(feed).toContain('<guid isPermaLink="true">https://perses.dev/blog/2026/10/21/release-v0550/</guid>');
    expect(feed).toContain('<atom:link href="https://perses.dev/blog/rss.xml" rel="self"');
  });

  it('makes the links absolute, including the links to a section of the post', async () => {
    const feed = await generateFeed();
    expect(feed).toContain('href="https://perses.dev/blog/2026/10/21/release-v0550/#breaking-changes"');
    expect(feed).not.toMatch(/(href|src)="[#/][^/]/);
  });

  it('generates the RSS feed of a category and rejects an unknown category', async () => {
    expect(await generateFeed('community')).not.toContain('release-v0550');
    expect(await generateFeed('unknown')).toBeUndefined();
  });

  it('generates the JSON feed with the post URLs as id, like the previous website', async () => {
    const feed = JSON.parse(await generateJsonFeed('/feed_json_created.json')) as {
      version: string;
      feed_url: string;
      items: { id: string; url: string; content_html: string }[];
    };
    expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
    expect(feed.feed_url).toBe('https://perses.dev/feed_json_created.json');
    expect(feed.items[0]?.id).toBe('https://perses.dev/blog/2026/10/21/release-v0550/');
    expect(feed.items.every((item) => item.id === item.url)).toBe(true);
    expect(feed.items[0]?.content_html).toContain('src="https://perses.dev/assets/images/blog/');
  });
});
