import { docsUrl, LATEST } from '../utils/urls.ts';
import { loadConfig } from './config.server.ts';

const websiteHosts = new Set(['perses.dev', 'www.perses.dev']);

/**
 * mapLegacyPath converts a path of the previous website (`/perses/docs/concepts/dashboard/`) to the new one
 * (`/docs/perses/latest/concepts/dashboard/`). It returns undefined when the path is not a legacy documentation path.
 */
export function mapLegacyPath(pathname: string): string | undefined {
  for (const source of loadConfig().docs.sources) {
    if (source.legacyPath === undefined) {
      continue;
    }
    const prefix = `/${source.legacyPath.replace(/^\/+|\/+$/g, '')}`;
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
      continue;
    }
    const slug = pathname
      .slice(prefix.length)
      .replace(/(^|\/)index\.html$/i, '')
      .replace(/\.md$/i, '')
      .replace(/(^|\/)(README|index)$/i, '')
      .replace(/^\/+|\/+$/g, '');
    return docsUrl(source.id, source.versioning ? LATEST : undefined, slug);
  }
  return undefined;
}

/**
 * mapLegacyUrl rewrites the links pointing to the previous website. Absolute links to perses.dev become relative.
 * It returns undefined when the URL doesn't need to change.
 */
export function mapLegacyUrl(url: string): string | undefined {
  if (url.startsWith('/') && !url.startsWith('//')) {
    const parsed = new URL(url, 'https://perses.dev');
    const mapped = mapLegacyPath(parsed.pathname);
    return mapped === undefined ? undefined : `${mapped}${parsed.search}${parsed.hash}`;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (!websiteHosts.has(parsed.hostname) || !/^https?:$/.test(parsed.protocol)) {
    return undefined;
  }
  return `${mapLegacyPath(parsed.pathname) ?? parsed.pathname}${parsed.search}${parsed.hash}`;
}
