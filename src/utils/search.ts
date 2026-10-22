export const LATEST_SCOPE = 'latest';

export interface SearchScope {
  /** Displayed in the search input when the search is restricted to a version. */
  label?: string;
  filters: Record<string, unknown>;
}

/**
 * versionScope is the value of the `scope` Pagefind filter identifying the pages of a version of a source.
 */
export function versionScope(source: string, version: string): string {
  return `${source}@${version}`;
}

/**
 * searchScope returns the Pagefind filters to apply from the current page. By default, only the latest version of
 * the documentation is searched. When browsing an explicit version of a source, the results of this source come from
 * this version.
 */
export function searchScope(pathname: string): SearchScope {
  const match = /^\/docs\/([a-z0-9-]+)\/(v\d+\.\d+)(\/|$)/.exec(pathname);
  if (!match?.[1] || !match[2]) {
    return { filters: { scope: LATEST_SCOPE } };
  }
  const [, source, version] = match;
  return {
    label: `${source} ${version}`,
    filters: {
      any: [{ scope: versionScope(source, version) }, { scope: LATEST_SCOPE, not: { source } }],
    },
  };
}
