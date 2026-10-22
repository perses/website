// Parsing of the GitHub releases, shared by the build (src/content/downloads.server.ts) and the browser, which checks
// if newer releases were published since the website was built.

export interface DownloadAsset {
  name: string;
  url: string;
  size: number;
  sha256?: string;
  os?: string;
  arch?: string;
  kind: 'archive' | 'checksums' | 'other';
}

export interface InstallCommand {
  label: string;
  /** Command template, with the placeholders {version} (e.g. v0.55.0) and {versionNumber} (e.g. 0.55.0). */
  command: string;
}

export interface BinaryRelease {
  id: string;
  title: string;
  description: string;
  repository: string;
  install: InstallCommand[];
  version: string;
  date: string;
  url: string;
  assets: DownloadAsset[];
}

export interface PluginRelease {
  /** Name of the plugin module, as used in the tag (`timeserieschart`). */
  id: string;
  /** Display name, from the archive name (`TimeSeriesChart`). */
  name: string;
  version: string;
  date: string;
  url: string;
  asset?: DownloadAsset;
}

export interface GitHubAsset {
  name: string;
  size: number;
  browser_download_url: string;
  digest?: string | null;
}

export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  assets: GitHubAsset[];
}

const platformRegexp =
  /_(linux|darwin|windows|freebsd|netbsd|openbsd)_(amd64|arm64|armv6|armv7|386|ppc64le|s390x|riscv64)\.(tar\.gz|zip)$/;

export function parseAsset(asset: GitHubAsset): DownloadAsset {
  const platform = platformRegexp.exec(asset.name);
  const sha256 = asset.digest?.startsWith('sha256:') ? asset.digest.slice('sha256:'.length) : undefined;
  return {
    name: asset.name,
    url: asset.browser_download_url,
    size: asset.size,
    sha256,
    os: platform?.[1],
    arch: platform?.[2],
    kind: platform ? 'archive' : /checksums?\.txt$/.test(asset.name) ? 'checksums' : /\.(tar\.gz|zip)$/.test(asset.name) ? 'archive' : 'other',
  };
}

function parseVersion(version: string): number[] {
  return (version.replace(/^v/, '').split('-')[0] ?? '').split('.').map((part) => Number(part) || 0);
}

/**
 * compareVersions compares two versions like `v0.55.0` or `0.55.0`. Pre-release suffixes are ignored.
 */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

export function renderInstallCommand(template: string, version: string): string {
  return template.replaceAll('{version}', version).replaceAll('{versionNumber}', version.replace(/^v/, ''));
}

/**
 * toBinaryRelease builds the release of a binary from the latest GitHub release of its repository.
 */
export function toBinaryRelease(binary: Omit<BinaryRelease, 'version' | 'date' | 'url' | 'assets'>, release: GitHubRelease): BinaryRelease {
  return {
    ...binary,
    version: release.tag_name,
    date: (release.published_at ?? '').slice(0, 10),
    url: release.html_url,
    assets: release.assets.map(parseAsset).filter((asset) => asset.kind !== 'other'),
  };
}

/**
 * latestPluginReleases keeps the latest final release of each plugin. Plugins are released with tags like
 * `<plugin>/vX.Y.Z`. The tags using the old naming convention are ignored.
 */
export function latestPluginReleases(releases: GitHubRelease[]): PluginRelease[] {
  const latest = new Map<string, PluginRelease>();
  for (const release of releases) {
    const match = /^([a-z0-9-]+)\/v(\d+\.\d+\.\d+)$/.exec(release.tag_name);
    if (!match?.[1] || !match[2] || release.draft || release.prerelease) {
      continue;
    }
    const [, id, version] = match;
    const current = latest.get(id);
    if (current !== undefined && compareVersions(current.version, version) >= 0) {
      continue;
    }
    const asset = release.assets.map(parseAsset).find((a) => a.kind === 'archive');
    latest.set(id, {
      id,
      name: asset?.name.replace(/-\d+\.\d+\.\d+.*$/, '') ?? id,
      version,
      date: (release.published_at ?? '').slice(0, 10),
      url: release.html_url,
      asset,
    });
  }
  return [...latest.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * mergePluginReleases updates a list of plugins with more recent releases. The plugins released for the first time
 * are added to the list.
 */
export function mergePluginReleases<T extends PluginRelease>(current: T[], recent: PluginRelease[]): (T | PluginRelease)[] {
  const merged = new Map<string, T | PluginRelease>(current.map((plugin) => [plugin.id, plugin]));
  for (const plugin of recent) {
    const existing = merged.get(plugin.id);
    if (existing === undefined || compareVersions(plugin.version, existing.version) > 0) {
      merged.set(plugin.id, { ...existing, ...plugin });
    }
  }
  return [...merged.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
