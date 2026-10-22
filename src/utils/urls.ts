export const LATEST = 'latest';

function joinSegments(...segments: (string | undefined)[]): string {
  const path = segments
    .filter((s): s is string => s !== undefined && s !== '')
    .map((s) => s.replace(/^\/+|\/+$/g, ''))
    .filter((s) => s !== '')
    .join('/');
  return path === '' ? '/' : `/${path}/`;
}

/**
 * docsUrl returns the URL of a documentation page. `version` is undefined for not versioned sources.
 */
export function docsUrl(source: string, version: string | undefined, slug = ''): string {
  return joinSegments('docs', source, version, slug);
}

export function blogUrl(page = 1): string {
  return page <= 1 ? '/blog/' : joinSegments('blog', 'page', String(page));
}

export function blogPostUrl(date: string, slug: string): string {
  const [year, month, day] = date.slice(0, 10).split('-');
  return joinSegments('blog', year, month, day, slug);
}

export function blogCategoryUrl(category: string, page = 1): string {
  return page <= 1 ? joinSegments('blog', 'category', category) : joinSegments('blog', 'category', category, 'page', String(page));
}

export function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}
