import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';
import { docsUrl, LATEST } from '../utils/urls.ts';
import { contentDir, isDev, loadConfig, type SourceConfig } from './config.server.ts';
import { mapLegacyUrl } from './legacy.server.ts';
import { loadManifest, type ManifestVersion } from './manifest.server.ts';
import { isExternalUrl, splitUrl, type UrlResolver } from './markdown/links.server.ts';
import { extractFrontmatter, type RenderedMarkdown, renderMarkdown } from './markdown/render.server.ts';
import { generateNav, type NavEntry, parseNav } from './nav.server.ts';
import type {
  DocsPageData,
  NavNode,
  RedirectData,
  SourceSummary,
  VersionOption,
} from './types.ts';
import { parseMinorVersion } from './versions.server.ts';

export interface PageFile {
  slug: string;
  relPath: string;
  absPath: string;
}

export interface DocsVersion {
  source: SourceConfig;
  manifest: ManifestVersion;
  versioned: boolean;
  isLatest: boolean;
  /** Pages indexed by slug. */
  pages: Map<string, PageFile>;
  /** Pages indexed by path relative to the docs directory. */
  files: Map<string, PageFile>;
  /** Files that are not markdown (images, examples, ...), relative to the docs directory. */
  assets: Set<string>;
  nav: NavEntry[];
  /** Where the navigation comes from, displayed in warnings. */
  navOrigin: string;
}

export interface DocsSource {
  config: SourceConfig;
  versioned: boolean;
  /** Sorted from the most recent to the oldest. */
  versions: DocsVersion[];
}

export interface DocsIndex {
  sources: Map<string, DocsSource>;
}

const ignoredEntries = new Set(['node_modules', '.git', '.github']);

function walk(dir: string, base = ''): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || ignoredEntries.has(entry.name)) {
      return [];
    }
    const relPath = base === '' ? entry.name : `${base}/${entry.name}`;
    if (entry.isDirectory()) {
      return walk(join(dir, entry.name), relPath);
    }
    return entry.isFile() ? [relPath] : [];
  });
}

export function slugFromPath(relPath: string): string {
  const withoutExtension = relPath.replace(/\.md$/i, '');
  const segments = withoutExtension.split('/');
  if (/^(readme|index)$/i.test(segments.at(-1) ?? '')) {
    segments.pop();
  }
  return segments.join('/');
}

function readNavFile(path: string, sourceIds: string[]): NavEntry[] | undefined {
  if (!existsSync(path)) {
    return undefined;
  }
  return parseNav(readFileSync(path, 'utf8'), sourceIds, path);
}

/**
 * loadNav looks for the navigation of a version in this order:
 * 1. `nav.yaml` at the root of the docs directory of the source,
 * 2. `content/nav/<source>/<version>.yaml` in the website repository,
 * 3. for versioned sources, the file of the closest lower version in `content/nav/<source>/`,
 * 4. a navigation generated from the files.
 */
function loadNav(
  source: SourceConfig,
  version: ManifestVersion,
  versioned: boolean,
  markdownFiles: string[],
  sourceIds: string[],
): { nav: NavEntry[]; origin: string } {
  const candidates = [join(version.dir, 'nav.yaml'), join(contentDir(), 'nav', source.id, `${version.id}.yaml`)];
  for (const candidate of candidates) {
    const nav = readNavFile(candidate, sourceIds);
    if (nav !== undefined) {
      return { nav, origin: candidate };
    }
  }
  const fallbackDir = join(contentDir(), 'nav', source.id);
  if (versioned && existsSync(fallbackDir)) {
    const current = parseMinorVersion(version.id);
    const closest = readdirSync(fallbackDir)
      .map((file) => /^(v\d+\.\d+)\.yaml$/.exec(file)?.[1])
      .filter((id): id is string => id !== undefined)
      .map((id) => ({ id, ...parseMinorVersion(id) }))
      .filter((v) => v.major < current.major || (v.major === current.major && v.minor <= current.minor))
      .toSorted((a, b) => b.major - a.major || b.minor - a.minor)[0];
    if (closest !== undefined) {
      const path = join(fallbackDir, `${closest.id}.yaml`);
      return { nav: readNavFile(path, sourceIds) ?? [], origin: path };
    }
  }
  return { nav: generateNav(markdownFiles), origin: 'generated from the files' };
}

function buildIndex(): DocsIndex {
  const config = loadConfig();
  const manifest = loadManifest();
  const sourceIds = config.docs.sources.map((s) => s.id);
  const sources = new Map<string, DocsSource>();
  for (const sourceConfig of config.docs.sources) {
    const manifestSource = manifest.sources[sourceConfig.id];
    if (manifestSource === undefined) {
      continue;
    }
    const versioned = sourceConfig.versioning !== undefined;
    const versions = manifestSource.versions.map((version, index): DocsVersion => {
      const files = walk(version.dir);
      const markdownFiles = files.filter((f) => f.toLowerCase().endsWith('.md'));
      const pages = new Map<string, PageFile>();
      const byPath = new Map<string, PageFile>();
      for (const relPath of markdownFiles) {
        const page = { slug: slugFromPath(relPath), relPath, absPath: join(version.dir, relPath) };
        // When both README.md and index.md exist, the first one wins.
        if (!pages.has(page.slug)) {
          pages.set(page.slug, page);
        }
        byPath.set(relPath, page);
      }
      const { nav, origin } = loadNav(sourceConfig, version, versioned, markdownFiles, sourceIds);
      return {
        source: sourceConfig,
        manifest: version,
        versioned,
        isLatest: index === 0,
        pages,
        files: byPath,
        assets: new Set(files.filter((f) => !f.toLowerCase().endsWith('.md'))),
        nav,
        navOrigin: origin,
      };
    });
    sources.set(sourceConfig.id, { config: sourceConfig, versioned, versions });
  }
  return { sources };
}

let cachedIndex: DocsIndex | undefined;

export function getDocsIndex(): DocsIndex {
  if (cachedIndex === undefined || isDev()) {
    cachedIndex = buildIndex();
  }
  return cachedIndex;
}

/** URL segment of a version, undefined for not versioned sources. */
function versionSegment(version: DocsVersion, preferLatest = true): string | undefined {
  if (!version.versioned) {
    return undefined;
  }
  return preferLatest && version.isLatest ? LATEST : version.manifest.id;
}

const titleCache = new Map<string, string>();

/**
 * pageTitle returns the title of a page from its front matter or its first h1, without rendering it.
 */
export function pageTitle(page: PageFile): string {
  const key = `${page.absPath}:${statSync(page.absPath).mtimeMs}`;
  const cached = titleCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const { data, body } = extractFrontmatter(readFileSync(page.absPath, 'utf8'));
  let title = typeof data.title === 'string' ? data.title : undefined;
  if (title === undefined) {
    const lines = body.split('\n');
    let inFence = false;
    for (let i = 0; i < lines.length && title === undefined; i++) {
      const line = lines[i] ?? '';
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) {
        continue;
      }
      const atx = /^#\s+(.+?)\s*#*\s*$/.exec(line);
      if (atx?.[1]) {
        title = atx[1];
      } else if (line.trim() !== '' && /^=+\s*$/.test(lines[i + 1] ?? '')) {
        title = line.trim();
      }
    }
  }
  const result = (title ?? page.slug.split('/').at(-1) ?? page.slug).replace(/`/g, '');
  titleCache.set(key, result);
  return result;
}

function normalizeNavPath(path: string): string {
  return posix.normalize(path.replace(/^\.?\//, '')).replace(/\/$/, '');
}

function findPage(version: DocsVersion, path: string): PageFile | undefined {
  const normalized = normalizeNavPath(path);
  return version.files.get(normalized) ?? version.pages.get(normalized.replace(/\.md$/i, ''));
}

const warned = new Set<string>();

function warnOnce(message: string) {
  if (!warned.has(message)) {
    warned.add(message);
    console.warn(`⚠ ${message}`);
  }
}

function resolveNavEntries(index: DocsIndex, version: DocsVersion, entries: NavEntry[]): NavNode[] {
  const segment = versionSegment(version);
  return entries.flatMap((entry): NavNode[] => {
    switch (entry.kind) {
      case 'section': {
        const children = resolveNavEntries(index, version, entry.children);
        return children.length > 0 ? [{ title: entry.title, children }] : [];
      }
      case 'link':
        return [{ title: entry.title, href: entry.href, external: isExternalUrl(entry.href) }];
      case 'page': {
        if (entry.source !== undefined && entry.source !== version.source.id) {
          const target = index.sources.get(entry.source)?.versions[0];
          const page = target && findPage(target, entry.path);
          if (target === undefined || page === undefined) {
            warnOnce(`${version.navOrigin}: page "${entry.source}:${entry.path}" not found`);
            return [];
          }
          return [
            { title: entry.title ?? pageTitle(page), href: docsUrl(entry.source, versionSegment(target), page.slug) },
          ];
        }
        const page = findPage(version, entry.path);
        if (page === undefined) {
          warnOnce(`${version.navOrigin}: page "${entry.path}" not found in ${version.source.id} ${version.manifest.id}`);
          return [];
        }
        return [{ title: entry.title ?? pageTitle(page), href: docsUrl(version.source.id, segment, page.slug) }];
      }
    }
  });
}

/**
 * findUnreferencedPages returns the pages of a version that are not reachable from its navigation.
 */
export function findUnreferencedPages(version: DocsVersion): string[] {
  const referenced = new Set<string>();
  const visit = (entries: NavEntry[]) => {
    for (const entry of entries) {
      if (entry.kind === 'section') {
        visit(entry.children);
      } else if (entry.kind === 'page' && (entry.source === undefined || entry.source === version.source.id)) {
        const page = findPage(version, entry.path);
        if (page) {
          referenced.add(page.relPath);
        }
      }
    }
  };
  visit(version.nav);
  return [...version.files.keys()].filter((path) => !referenced.has(path) && path !== 'nav.yaml');
}

function githubUrl(version: DocsVersion, relPath: string, mode: 'blob' | 'edit' = 'blob'): string {
  const ref = version.manifest.ref === 'local' ? 'main' : version.manifest.ref;
  const path = posix.normalize(`${version.source.docsDir}/${relPath}`);
  return `https://github.com/${version.source.repository}/${mode}/${ref}/${path}`;
}

export function assetUrl(version: DocsVersion, relPath: string): string {
  return `/docs-assets/${version.source.id}/${version.manifest.id}/${relPath.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * createDocsUrlResolver rewrites the URLs of a documentation page: links to other markdown files become links to the
 * corresponding pages, images and other files are served from `/docs-assets/` and links to the previous website are
 * converted to the new URLs.
 */
export function createDocsUrlResolver(version: DocsVersion, page: PageFile, segment: string | undefined): UrlResolver {
  return (url, kind) => {
    if (url.startsWith('#')) {
      return undefined;
    }
    if (isExternalUrl(url)) {
      return mapLegacyUrl(url);
    }
    if (url.startsWith('/')) {
      return mapLegacyUrl(url);
    }
    const { path, suffix } = splitUrl(url);
    let decoded: string;
    try {
      decoded = decodeURI(path);
    } catch {
      decoded = path;
    }
    const resolved = posix.normalize(posix.join(posix.dirname(page.relPath), decoded));
    if (resolved.startsWith('../')) {
      return `${githubUrl(version, resolved)}${suffix}`;
    }
    const cleaned = resolved.replace(/\/$/, '').replace(/^\.$/, '');
    if (version.assets.has(cleaned)) {
      return `${assetUrl(version, cleaned)}${suffix}`;
    }
    const target =
      version.files.get(cleaned) ??
      version.pages.get(cleaned.replace(/\.md$/i, '')) ??
      version.files.get(`${cleaned}/README.md`) ??
      version.files.get(`${cleaned}/index.md`);
    if (target !== undefined) {
      return `${docsUrl(version.source.id, segment, target.slug)}${suffix}`;
    }
    if (kind === 'link') {
      warnOnce(`${version.source.id} ${version.manifest.id} ${page.relPath}: broken link "${url}"`);
    }
    return `${githubUrl(version, cleaned)}${suffix}`;
  };
}

const renderCache = new Map<string, Promise<RenderedMarkdown>>();

export function renderDocsPage(version: DocsVersion, page: PageFile, segment: string | undefined) {
  const key = `${page.absPath}:${statSync(page.absPath).mtimeMs}:${segment ?? ''}`;
  let rendered = renderCache.get(key);
  if (rendered === undefined) {
    rendered = renderMarkdown(readFileSync(page.absPath, 'utf8'), {
      resolveUrl: createDocsUrlResolver(version, page, segment),
    });
    renderCache.set(key, rendered);
  }
  return rendered;
}

function firstNavPage(version: DocsVersion, entries: NavEntry[]): PageFile | undefined {
  for (const entry of entries) {
    if (entry.kind === 'section') {
      const page = firstNavPage(version, entry.children);
      if (page !== undefined) {
        return page;
      }
    } else if (entry.kind === 'page' && (entry.source === undefined || entry.source === version.source.id)) {
      const page = findPage(version, entry.path);
      if (page !== undefined) {
        return page;
      }
    }
  }
  return undefined;
}

/**
 * entryUrl returns the URL of the entry point of a version: the page at the root of the docs directory (README.md or
 * index.md) when it exists, otherwise the first page of the navigation.
 */
export function entryUrl(version: DocsVersion, segment = versionSegment(version)): string {
  const page =
    version.pages.get('') ??
    firstNavPage(version, version.nav) ??
    [...version.pages.values()].toSorted((a, b) => a.slug.localeCompare(b.slug))[0];
  return docsUrl(version.source.id, segment, page?.slug ?? '');
}

export function sourceSummary(source: DocsSource): SourceSummary {
  const latest = source.versions[0];
  return {
    id: source.config.id,
    title: source.config.title,
    description: source.config.description,
    href: latest === undefined ? docsUrl(source.config.id, undefined) : entryUrl(latest),
    versioned: source.versioned,
    latestRelease: source.versioned ? latest?.manifest.release : undefined,
  };
}

export function listSourceSummaries(): SourceSummary[] {
  return [...getDocsIndex().sources.values()].map(sourceSummary);
}

type ResolvedRoute =
  | { type: 'page'; source: DocsSource; version: DocsVersion; segment: string | undefined; slug: string }
  | { type: 'redirect'; to: string };

export function resolveDocsRoute(sourceId: string, splat: string): ResolvedRoute | undefined {
  const source = getDocsIndex().sources.get(sourceId);
  const latest = source?.versions[0];
  if (source === undefined || latest === undefined) {
    return undefined;
  }
  const segments = splat.split('/').filter((s) => s !== '');
  const page = (version: DocsVersion, segment: string | undefined, slug: string): ResolvedRoute =>
    // The root of a version without a root page redirects to the first page of its navigation.
    slug === '' && !version.pages.has('')
      ? { type: 'redirect', to: entryUrl(version, segment) }
      : { type: 'page', source, version, segment, slug };
  if (!source.versioned) {
    return page(latest, undefined, segments.join('/'));
  }
  const [first, ...rest] = segments;
  const slug = rest.join('/');
  if (first === undefined) {
    return { type: 'redirect', to: entryUrl(latest) };
  }
  if (first === LATEST) {
    return page(latest, LATEST, slug);
  }
  const version = source.versions.find((v) => v.manifest.id === first);
  if (version !== undefined) {
    return page(version, version.manifest.id, slug);
  }
  // URL without version, for example a link written by hand: redirect to the latest version when the page exists.
  const unversionedSlug = segments.join('/');
  if (latest.pages.has(unversionedSlug)) {
    return { type: 'redirect', to: docsUrl(sourceId, LATEST, unversionedSlug) };
  }
  return undefined;
}

function versionOptions(source: DocsSource, slug: string): VersionOption[] {
  if (!source.versioned) {
    return [];
  }
  return source.versions.map((version) => ({
    id: version.manifest.id,
    label: version.isLatest ? `${version.manifest.id} (latest)` : version.manifest.id,
    href: version.pages.has(slug) ? docsUrl(source.config.id, versionSegment(version), slug) : entryUrl(version),
    latest: version.isLatest,
  }));
}

export async function loadDocsPage(
  sourceId: string,
  splat: string,
): Promise<DocsPageData | RedirectData | undefined> {
  const route = resolveDocsRoute(sourceId, splat);
  if (route === undefined || route.type === 'redirect') {
    return route === undefined ? undefined : { to: route.to };
  }
  const { source, version, segment, slug } = route;
  const index = getDocsIndex();
  const page = version.pages.get(slug);
  if (page === undefined) {
    return undefined;
  }
  const path = docsUrl(sourceId, segment, slug);
  const rendered = await renderDocsPage(version, page, segment);
  return {
    source: sourceSummary(source),
    version: segment,
    resolvedVersion: source.versioned ? version.manifest.id : undefined,
    isLatest: version.isLatest,
    versions: versionOptions(source, slug),
    nav: resolveNavEntries(index, version, version.nav),
    sources: [...index.sources.values()].map(sourceSummary),
    path,
    canonical: version.isLatest ? docsUrl(sourceId, versionSegment(version), slug) : path,
    editUrl: githubUrl(version, page.relPath, version.manifest.ref === version.manifest.release ? 'blob' : 'edit'),
    content: {
      title: rendered.title || pageTitle(page),
      toc: rendered.toc,
      hast: rendered.hast,
      hasMermaid: rendered.hasMermaid,
    },
  };
}

/**
 * listDocsPaths returns every URL of the documentation to prerender, including the redirections.
 */
export function listDocsPaths(): string[] {
  const paths = new Set<string>(['/docs/']);
  for (const source of getDocsIndex().sources.values()) {
    const id = source.config.id;
    paths.add(docsUrl(id, undefined));
    for (const version of source.versions) {
      const segments = version.versioned
        ? version.isLatest
          ? [LATEST, version.manifest.id]
          : [version.manifest.id]
        : [undefined];
      for (const segment of segments) {
        paths.add(docsUrl(id, segment));
        for (const slug of version.pages.keys()) {
          paths.add(docsUrl(id, segment, slug));
        }
      }
    }
    const latest = source.versions[0];
    if (source.config.legacyPath && latest) {
      for (const slug of ['', ...latest.pages.keys()]) {
        paths.add(`/${source.config.legacyPath}/${slug}${slug === '' ? '' : '/'}`);
      }
    }
  }
  return [...paths];
}

/**
 * reportNavigationIssues prints the pages missing from the navigation, to help maintaining the nav.yaml files.
 */
export function reportNavigationIssues(): void {
  for (const source of getDocsIndex().sources.values()) {
    for (const version of source.versions) {
      const missing = findUnreferencedPages(version);
      if (missing.length > 0) {
        warnOnce(
          `${source.config.id} ${version.manifest.id}: ${missing.length} page(s) not referenced in the navigation (${version.navOrigin}): ${missing.join(', ')}`,
        );
      }
    }
  }
}

/**
 * listCanonicalDocsPaths returns the URLs of the documentation pages that are not duplicates or redirections, for the
 * sitemap.
 */
export function listCanonicalDocsPaths(): string[] {
  const paths: string[] = [];
  for (const source of getDocsIndex().sources.values()) {
    for (const version of source.versions) {
      const segment = versionSegment(version);
      for (const slug of version.pages.keys()) {
        paths.push(docsUrl(source.config.id, segment, slug));
      }
    }
  }
  return paths;
}
