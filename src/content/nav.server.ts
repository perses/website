import { parse } from 'yaml';

/**
 * NavEntry is an entry of a `nav.yaml` file. The syntax is close to the `nav` section of mkdocs:
 *
 * ```yaml
 * - overview.md                         # page, the title is the first h1 of the page
 * - Getting started: getting-started.md # page with an explicit title
 * - Concepts:                           # section
 *     - Dashboard: concepts/dashboard.md
 * - Helm: helm-charts:installation.md   # page of another documentation source
 * - Plugins: /docs/plugins/             # link to another page of the website
 * - Demo: https://demo.perses.dev       # external link
 * ```
 */
export type NavEntry =
  | { kind: 'page'; title?: string; source?: string; path: string }
  | { kind: 'link'; title: string; href: string }
  | { kind: 'section'; title: string; children: NavEntry[] };

const crossSourceRegexp = /^([a-z0-9-]+):(?!\/\/)(.*)$/;

function parseTarget(title: string | undefined, value: string, sourceIds: ReadonlySet<string>): NavEntry {
  const target = value.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(target) || target.startsWith('/') || target.startsWith('mailto:')) {
    return { kind: 'link', title: title ?? target, href: target };
  }
  const crossSource = crossSourceRegexp.exec(target);
  if (crossSource?.[1] && sourceIds.has(crossSource[1])) {
    return { kind: 'page', title, source: crossSource[1], path: crossSource[2] ?? '' };
  }
  return { kind: 'page', title, path: target };
}

function parseEntries(value: unknown, sourceIds: ReadonlySet<string>, location: string): NavEntry[] {
  if (!Array.isArray(value)) {
    throw new Error(`${location}: expected a list of navigation entries`);
  }
  return value.map((item: unknown, index): NavEntry => {
    const itemLocation = `${location}[${index}]`;
    if (typeof item === 'string') {
      return parseTarget(undefined, item, sourceIds);
    }
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`${itemLocation}: expected a string or a "title: value" entry`);
    }
    const entries = Object.entries(item as Record<string, unknown>);
    if (entries.length !== 1) {
      throw new Error(`${itemLocation}: an entry must have exactly one key, got ${entries.length}`);
    }
    const [[title, target]] = entries as [[string, unknown]];
    if (typeof target === 'string') {
      return parseTarget(title, target, sourceIds);
    }
    return { kind: 'section', title, children: parseEntries(target, sourceIds, `${itemLocation}.${title}`) };
  });
}

export function parseNav(raw: string, sourceIds: Iterable<string>, location = 'nav'): NavEntry[] {
  return parseEntries(parse(raw) ?? [], new Set(sourceIds), location);
}

/**
 * collectPages returns every page path referenced by the navigation for the given source (undefined = current one).
 */
export function collectPages(entries: NavEntry[], source?: string): string[] {
  return entries.flatMap((entry) => {
    if (entry.kind === 'section') {
      return collectPages(entry.children, source);
    }
    return entry.kind === 'page' && entry.source === source ? [entry.path] : [];
  });
}

const isIndex = (path: string) => /(^|\/)(README|index)\.md$/i.test(path);

/**
 * generateNav builds a navigation from the files of a documentation source when no `nav.yaml` is available:
 * one entry per page, one section per directory, sorted alphabetically with the README/index first.
 */
export function generateNav(paths: string[]): NavEntry[] {
  interface Dir {
    pages: string[];
    dirs: Map<string, Dir>;
  }
  const root: Dir = { pages: [], dirs: new Map() };
  for (const path of paths.toSorted()) {
    const segments = path.split('/');
    let dir = root;
    for (const segment of segments.slice(0, -1)) {
      let child = dir.dirs.get(segment);
      if (child === undefined) {
        child = { pages: [], dirs: new Map() };
        dir.dirs.set(segment, child);
      }
      dir = child;
    }
    dir.pages.push(path);
  }
  const toEntries = (dir: Dir): NavEntry[] => [
    ...dir.pages
      .toSorted((a, b) => Number(isIndex(b)) - Number(isIndex(a)) || a.localeCompare(b))
      .map((path): NavEntry => ({ kind: 'page', path })),
    ...[...dir.dirs.entries()].map(
      ([name, child]): NavEntry => ({
        kind: 'section',
        title: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
        children: toEntries(child),
      }),
    ),
  ];
  return toEntries(root);
}
