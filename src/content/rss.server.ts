import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';
import { loadConfig } from './config.server.ts';
import { loadPosts } from './blog.server.ts';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/**
 * absolutize makes the links and images of a post absolute, as feed readers don't know the URL of the website.
 */
function absolutize(tree: Root, siteUrl: string): Root {
  const copy = structuredClone(tree);
  visit(copy, 'element', (node) => {
    for (const property of ['href', 'src', 'poster']) {
      const value = node.properties[property];
      if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
        node.properties[property] = `${siteUrl}${value}`;
      }
    }
  });
  return copy;
}

/**
 * feedContent returns the posts of a feed, optionally restricted to a category, and its metadata.
 * It returns undefined when the category doesn't exist.
 */
async function feedContent(categorySlug?: string) {
  const config = loadConfig();
  const siteUrl = config.site.url.replace(/\/$/, '');
  const posts = (await loadPosts()).filter(
    (post) => categorySlug === undefined || post.categories.some((c) => c.slug === categorySlug),
  );
  const category = posts.flatMap((post) => post.categories).find((c) => c.slug === categorySlug);
  if (categorySlug !== undefined && category === undefined) {
    return undefined;
  }
  return {
    config,
    siteUrl,
    posts,
    title: category === undefined ? config.blog.title : `${config.blog.title} - ${category.name}`,
    link: category === undefined ? `${siteUrl}/blog/` : `${siteUrl}/blog/category/${category.slug}/`,
  };
}

/**
 * generateJsonFeed generates the JSON feed (https://jsonfeed.org/version/1.1) of the blog.
 * `feedPath` is the path of the feed itself.
 */
export async function generateJsonFeed(feedPath: string): Promise<string> {
  const { config, siteUrl, posts, title, link } = (await feedContent())!;
  return `${JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title,
      home_page_url: link,
      feed_url: `${siteUrl}${feedPath}`,
      description: config.blog.description,
      icon: `${siteUrl}/assets/images/favicon.png`,
      language: 'en',
      items: posts.map((post) => ({
        id: `${siteUrl}${post.url}`,
        url: `${siteUrl}${post.url}`,
        title: post.title,
        summary: post.description,
        content_html: toHtml(absolutize(post.content.hast, siteUrl)),
        date_published: `${post.date}T00:00:00Z`,
        tags: post.categories.map((category) => category.name),
        ...(post.authors.length > 0 ? { authors: post.authors.map((name) => ({ name })) } : {}),
      })),
    },
    null,
    2,
  )}\n`;
}

/**
 * generateFeed generates the RSS 2.0 feed of the blog, optionally restricted to a category.
 */
export async function generateFeed(categorySlug?: string): Promise<string | undefined> {
  const content = await feedContent(categorySlug);
  if (content === undefined) {
    return undefined;
  }
  const { config, siteUrl, posts, title, link } = content;
  const self = `${link}rss.xml`;
  const lastBuild = posts[0] === undefined ? new Date() : new Date(`${posts[0].date}T00:00:00Z`);

  const items = posts.map((post) => {
    const url = `${siteUrl}${post.url}`;
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>`,
      ...post.authors.map((author) => `      <dc:creator>${escapeXml(author)}</dc:creator>`),
      ...post.categories.map((c) => `      <category>${escapeXml(c.name)}</category>`),
      `      <description>${escapeXml(post.description)}</description>`,
      `      <content:encoded>${cdata(toHtml(absolutize(post.content.hast, siteUrl)))}</content:encoded>`,
      '    </item>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(link)}</link>`,
    `    <description>${escapeXml(config.blog.description)}</description>`,
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>`,
    '    <language>en</language>',
    `    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>`,
    `    <image><url>${siteUrl}/assets/images/favicon.png</url><title>${escapeXml(title)}</title><link>${escapeXml(link)}</link></image>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
