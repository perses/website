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

import {
  type BinaryRelease,
  compareVersions,
  type GitHubRelease,
  latestPluginReleases,
  mergePluginReleases,
  type PluginRelease,
  toBinaryRelease,
} from './releases';

// The pages are built with the releases available at build time. In the browser, GitHub is queried to display the
// releases published since then. The GitHub API allows 60 requests per hour and per IP address without
// authentication, so the responses are cached in the session storage and every error is ignored: the data of the
// build is displayed instead.

const CACHE_PREFIX = 'perses-website:github-releases:v1:';
const CACHE_TTL = 10 * 60 * 1000;
const RATE_LIMITED_KEY = `${CACHE_PREFIX}rate-limited-until`;

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // The storage is full or not available: the value is simply not stored.
  }
}

function minimize(release: GitHubRelease): GitHubRelease {
  return {
    tag_name: release.tag_name,
    name: release.name,
    html_url: release.html_url,
    draft: release.draft,
    prerelease: release.prerelease,
    published_at: release.published_at,
    assets: release.assets.map(({ name, size, browser_download_url, digest }) => ({ name, size, browser_download_url, digest })),
  };
}

// Requests in progress, so the components asking for the same data at the same time share the same request.
const inflight = new Map<string, Promise<unknown>>();

function fetchGitHub<T extends GitHubRelease | GitHubRelease[]>(path: string): Promise<T> {
  let request = inflight.get(path) as Promise<T> | undefined;
  if (request === undefined) {
    request = fetchGitHubUncached<T>(path).finally(() => inflight.delete(path));
    inflight.set(path, request);
  }
  return request;
}

async function fetchGitHubUncached<T extends GitHubRelease | GitHubRelease[]>(path: string): Promise<T> {
  const key = `${CACHE_PREFIX}${path}`;
  const cached = readStorage(key);
  if (cached !== null) {
    try {
      const { at, data } = JSON.parse(cached) as { at: number; data: T };
      if (Date.now() - at < CACHE_TTL) {
        return data;
      }
    } catch {
      // Invalid entry: query GitHub.
    }
  }
  if (Number(readStorage(RATE_LIMITED_KEY)) > Date.now()) {
    throw new Error('GitHub API rate limit exceeded');
  }
  const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) {
    // Don't query GitHub again before the end of the rate limit window.
    if ((response.status === 403 || response.status === 429) && response.headers.get('x-ratelimit-remaining') === '0') {
      const reset = Number(response.headers.get('x-ratelimit-reset'));
      writeStorage(RATE_LIMITED_KEY, String(reset > 0 ? reset * 1000 : Date.now() + CACHE_TTL));
    }
    throw new Error(`GitHub API ${path}: ${response.status}`);
  }
  const json = (await response.json()) as T;
  const data = (Array.isArray(json) ? json.map(minimize) : minimize(json)) as T;
  writeStorage(key, JSON.stringify({ at: Date.now(), data }));
  return data;
}

export function fetchLatestRelease(repository: string): Promise<GitHubRelease> {
  return fetchGitHub<GitHubRelease>(`/repos/${repository}/releases/latest`);
}

/**
 * fetchRecentReleases returns the 100 most recent releases, enough to find the plugins released since the build.
 */
export function fetchRecentReleases(repository: string): Promise<GitHubRelease[]> {
  return fetchGitHub<GitHubRelease[]>(`/repos/${repository}/releases?per_page=100`);
}

export type BinaryConfig = Omit<BinaryRelease, 'version' | 'date' | 'url' | 'assets'>;

/**
 * refreshBinaries returns the binaries with their latest release. It returns undefined when nothing changed, and
 * keeps the known release of a binary when its latest release can't be fetched.
 */
export async function refreshBinaries(
  configs: BinaryConfig[],
  current: BinaryRelease[] | undefined,
  fetchLatest: (repository: string) => Promise<GitHubRelease> = fetchLatestRelease,
): Promise<BinaryRelease[] | undefined> {
  let changed = false;
  const binaries = await Promise.all(
    configs.map(async (config): Promise<BinaryRelease | undefined> => {
      const known = current?.find((binary) => binary.id === config.id);
      try {
        const release = await fetchLatest(config.repository);
        if (known === undefined || compareVersions(release.tag_name, known.version) > 0) {
          changed = true;
          return toBinaryRelease(config, release);
        }
      } catch {
        // Keep the release known at build time.
      }
      return known;
    }),
  );
  return changed ? binaries.filter((binary) => binary !== undefined) : undefined;
}

/**
 * refreshPlugins returns the plugins updated with the releases published since the build. It returns undefined when
 * nothing changed.
 */
export async function refreshPlugins<T extends PluginRelease>(
  repository: string,
  current: T[] | undefined,
  fetchRecent: (repository: string) => Promise<GitHubRelease[]> = fetchRecentReleases,
): Promise<(T | PluginRelease)[] | undefined> {
  let recent: PluginRelease[];
  try {
    recent = latestPluginReleases(await fetchRecent(repository));
  } catch {
    return undefined;
  }
  const merged = mergePluginReleases(current ?? [], recent);
  const changed = merged.some((plugin) => {
    const known = current?.find((p) => p.id === plugin.id);
    return known === undefined || known.version !== plugin.version;
  });
  return changed ? merged : undefined;
}
