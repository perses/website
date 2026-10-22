import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  type BinaryRelease,
  type GitHubRelease,
  latestPluginReleases,
  type PluginRelease,
  toBinaryRelease,
} from '../utils/releases.ts';
import { cacheDir, loadConfig } from './config.server.ts';

export type { BinaryRelease, DownloadAsset, PluginRelease } from '../utils/releases.ts';

export interface DownloadsData {
  generatedAt: string;
  binaries: BinaryRelease[];
  plugins: PluginRelease[];
  pluginsRepository: string;
}

async function github<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${path}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function allReleases(repository: string): Promise<GitHubRelease[]> {
  const releases: GitHubRelease[] = [];
  for (let page = 1; page < 50; page++) {
    const batch = await github<GitHubRelease[]>(`/repos/${repository}/releases?per_page=100&page=${page}`);
    releases.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }
  return releases;
}

export function downloadsPath(): string {
  return join(cacheDir(), 'downloads.json');
}

/**
 * syncDownloads fetches the latest releases from GitHub and stores them in the cache directory.
 * Set GITHUB_TOKEN to avoid the rate limit of the GitHub API.
 */
export async function syncDownloads(log: (message: string) => void = console.log): Promise<DownloadsData> {
  const config = loadConfig().downloads;
  const binaries = await Promise.all(
    config.binaries.map(async (binary): Promise<BinaryRelease> => {
      const release = await github<GitHubRelease>(`/repos/${binary.repository}/releases/latest`);
      log(`✓ ${binary.repository} ${release.tag_name}`);
      // The install commands are kept as templates, rendered with the version displayed on the page.
      return toBinaryRelease(binary, release);
    }),
  );
  const plugins = latestPluginReleases(await allReleases(config.plugins.repository));
  log(`✓ ${config.plugins.repository} ${plugins.length} plugins`);
  const data: DownloadsData = {
    generatedAt: new Date().toISOString(),
    binaries,
    plugins,
    pluginsRepository: config.plugins.repository,
  };
  await mkdir(cacheDir(), { recursive: true });
  await writeFile(downloadsPath(), `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

export function loadDownloads(): DownloadsData | undefined {
  const path = downloadsPath();
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as DownloadsData) : undefined;
}
