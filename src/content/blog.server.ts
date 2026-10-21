import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';
import type { Root as HastRoot } from 'hast';
import { toString } from 'hast-util-to-string';
import { slugify } from '../utils/slugify.ts';
import { blogCategoryUrl, blogPostUrl } from '../utils/urls.ts';
import { contentDir, isDev, loadConfig } from './config.server.ts';
import { mapLegacyUrl } from './legacy.server.ts';
import { isExternalUrl, type UrlResolver } from './markdown/links.server.ts';
import { renderMarkdown } from './markdown/render.server.ts';
import type { BlogArchiveYear, BlogCategory, BlogPost, BlogPostSummary } from './types.ts';

function postsDir(): string {
  return join(contentDir(), 'blog', 'posts');
}

/**
 * The posts used to be in `docs/blog/posts/` with the images in `docs/assets/`, so the relative links look like
 * `../../assets/images/...`. They are resolved as if the posts were still at this location.
 */
const blogUrlResolver: UrlResolver = (url) => {
  if (url.startsWith('#')) {
    return undefined;
  }
  if (isExternalUrl(url) || url.startsWith('/')) {
    return mapLegacyUrl(url);
  }
  return posix.normalize(posix.join('/blog/posts/', url));
};

function normalizeDate(value: unknown, file: string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  throw new Error(`${file}: the front matter must define a "date" (YYYY-MM-DD)`);
}

function stringList(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function firstParagraph(tree: HastRoot): string {
  for (const node of tree.children) {
    if (node.type === 'element' && node.tagName === 'p') {
      return toString(node).replace(/\s+/g, ' ').trim();
    }
  }
  return '';
}

function truncate(text: string, length: number): string {
  return text.length <= length ? text : `${text.slice(0, text.lastIndexOf(' ', length))}…`;
}

async function loadPostFile(file: string): Promise<BlogPost | undefined> {
  const path = join(postsDir(), file);
  const rendered = await renderMarkdown(readFileSync(path, 'utf8'), { resolveUrl: blogUrlResolver, removeTitle: true });
  const { frontmatter } = rendered;
  if (frontmatter.draft === true && !isDev()) {
    return undefined;
  }
  if (rendered.title === '') {
    throw new Error(`${path}: a blog post must have a title (front matter "title" or a h1)`);
  }
  const date = normalizeDate(frontmatter.date, path);
  const slug = typeof frontmatter.slug === 'string' ? frontmatter.slug : slugify(rendered.title);
  const categories: BlogCategory[] = stringList(frontmatter.categories).map((name) => ({ name, slug: slugify(name) }));
  // Without a `<!-- more -->` marker, the excerpt is the first paragraph.
  const firstParagraphNode = rendered.hast.children.find((node) => node.type === 'element' && node.tagName === 'p');
  const excerpt: HastRoot = rendered.excerpt ?? { type: 'root', children: firstParagraphNode ? [firstParagraphNode] : [] };
  const description =
    typeof frontmatter.description === 'string' ? frontmatter.description : truncate(firstParagraph(rendered.hast), 200);
  return {
    slug,
    url: blogPostUrl(date, slug),
    title: rendered.title,
    date,
    description,
    categories,
    authors: stringList(frontmatter.authors),
    readingTime: Math.max(1, Math.round(rendered.text.split(/\s+/).length / 200)),
    excerpt,
    hasMore: rendered.excerpt !== undefined,
    content: { title: rendered.title, toc: rendered.toc, hast: rendered.hast, hasMermaid: rendered.hasMermaid },
  };
}

let cache: { key: string; posts: Promise<BlogPost[]> } | undefined;

/**
 * loadPosts returns every blog post, from the most recent to the oldest.
 */
export function loadPosts(): Promise<BlogPost[]> {
  const dir = postsDir();
  const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.md')) : [];
  const key = files.map((file) => `${file}:${statSync(join(dir, file)).mtimeMs}`).join('|');
  if (cache?.key !== key) {
    const posts = Promise.all(files.map(loadPostFile)).then((loaded) => {
      const result = loaded
        .filter((post): post is BlogPost => post !== undefined)
        .toSorted((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
      const urls = new Set<string>();
      for (const post of result) {
        if (urls.has(post.url)) {
          throw new Error(`two blog posts have the same URL ${post.url}, set a different "slug" in one of them`);
        }
        urls.add(post.url);
      }
      return result;
    });
    cache = { key, posts };
  }
  return cache.posts;
}

export function toSummary({ content: _content, ...summary }: BlogPost): BlogPostSummary {
  return summary;
}

export interface BlogCategorySummary extends BlogCategory {
  url: string;
  count: number;
}

export async function loadCategories(): Promise<BlogCategorySummary[]> {
  const categories = new Map<string, BlogCategorySummary>();
  for (const post of await loadPosts()) {
    for (const category of post.categories) {
      const existing = categories.get(category.slug);
      if (existing) {
        existing.count++;
      } else {
        categories.set(category.slug, { ...category, url: blogCategoryUrl(category.slug), count: 1 });
      }
    }
  }
  return [...categories.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * buildArchive groups the posts by year, keeping their order (from the most recent to the oldest).
 */
export function buildArchive(posts: Pick<BlogPost, 'title' | 'url' | 'date'>[]): BlogArchiveYear[] {
  const years: BlogArchiveYear[] = [];
  for (const { title, url, date } of posts) {
    const year = date.slice(0, 4);
    let group = years.at(-1);
    if (group?.year !== year) {
      group = { year, posts: [] };
      years.push(group);
    }
    group.posts.push({ title, url, date });
  }
  return years;
}

export interface BlogListData {
  title: string;
  description: string;
  category?: BlogCategorySummary;
  categories: BlogCategorySummary[];
  posts: BlogPostSummary[];
  /** Every post of the blog, whatever the category and the page, grouped by year. */
  archive: BlogArchiveYear[];
  page: number;
  totalPages: number;
}

/**
 * loadBlogList returns a page of the list of posts, optionally restricted to a category.
 * It returns undefined when the category or the page doesn't exist.
 */
export async function loadBlogList(page: number, categorySlug?: string): Promise<BlogListData | undefined> {
  const config = loadConfig();
  const categories = await loadCategories();
  const category = categorySlug === undefined ? undefined : categories.find((c) => c.slug === categorySlug);
  if (categorySlug !== undefined && category === undefined) {
    return undefined;
  }
  const allPosts = await loadPosts();
  const posts = allPosts.filter(
    (post) => category === undefined || post.categories.some((c) => c.slug === category.slug),
  );
  const perPage = config.blog.postsPerPage;
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) {
    return undefined;
  }
  return {
    title: category === undefined ? config.blog.title : category.name,
    description: config.blog.description,
    category,
    categories,
    posts: posts.slice((page - 1) * perPage, page * perPage).map(toSummary),
    archive: buildArchive(allPosts),
    page,
    totalPages,
  };
}

export async function loadPost(year: string, month: string, day: string, slug: string): Promise<BlogPost | undefined> {
  return (await loadPosts()).find((post) => post.date === `${year}-${month}-${day}` && post.slug === slug);
}

/**
 * listBlogPaths returns every URL of the blog to prerender.
 */
export async function listBlogPaths(): Promise<string[]> {
  const config = loadConfig();
  const posts = await loadPosts();
  const categories = await loadCategories();
  const pages = (count: number, url: (page: number) => string) =>
    Array.from({ length: Math.max(1, Math.ceil(count / config.blog.postsPerPage)) }, (_, index) => url(index + 1));
  return [
    ...pages(posts.length, (page) => (page === 1 ? '/blog/' : `/blog/page/${page}/`)),
    ...posts.map((post) => post.url),
    ...categories.flatMap((category) => [
      ...pages(category.count, (page) => blogCategoryUrl(category.slug, page)),
      `/blog/category/${category.slug}/rss.xml`,
    ]),
    '/blog/rss.xml',
    '/feed_rss_created.xml',
    // Archive pages of the previous website, redirected to the blog.
    ...[...new Set(posts.map((post) => post.date.slice(0, 4)))].map((year) => `/blog/archive/${year}/`),
  ];
}
