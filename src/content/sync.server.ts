import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import { promisify } from 'node:util';
import * as tar from 'tar';
import { loadConfig, rootDir, type SourceConfig } from './config.server.ts';
import {
  type Manifest,
  type ManifestSource,
  type ManifestVersion,
  manifestPath,
  readManifest,
  sourcesCacheDir,
} from './manifest.server.ts';
import { parseLsRemote, resolveVersions } from './versions.server.ts';

const execFileAsync = promisify(execFile);

async function lsRemote(repository: string, flags: string[], patterns: string[] = []): Promise<string> {
  const args = ['ls-remote', ...flags, `https://github.com/${repository}.git`, ...patterns];
  const { stdout } = await execFileAsync('git', args, {
    maxBuffer: 32 * 1024 * 1024,
  });
  return stdout;
}

/**
 * downloadDocs downloads the archive of the repository at the given commit and extracts the docs directory only.
 */
async function downloadDocs(source: SourceConfig, sha: string, destination: string): Promise<void> {
  const response = await fetch(`https://codeload.github.com/${source.repository}/tar.gz/${sha}`);
  if (!response.ok || response.body === null) {
    throw new Error(`unable to download ${source.repository}@${sha}: ${response.status} ${response.statusText}`);
  }
  const docsDir = source.docsDir.replace(/^\/+|\/+$/g, '');
  const depth = docsDir.split('/').length;
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await pipeline(
    Readable.fromWeb(response.body as NodeReadableStream<Uint8Array>),
    tar.x({
      cwd: destination,
      strip: 1 + depth,
      // The first segment of each entry is the archive root folder `<repo>-<sha>`.
      filter: (path) => path.split('/').slice(1, 1 + depth).join('/') === docsDir && path.split('/').length > 1 + depth,
    }),
  );
}

async function resolveSource(source: SourceConfig): Promise<Omit<ManifestVersion, 'dir'>[]> {
  if (source.versioning) {
    const output = await lsRemote(source.repository, ['--tags', '--heads']);
    return resolveVersions(parseLsRemote(output), source.versioning);
  }
  const branch = source.branch ?? 'main';
  const [ref] = parseLsRemote(await lsRemote(source.repository, [], [`refs/heads/${branch}`]));
  if (ref === undefined) {
    throw new Error(`branch "${branch}" not found in ${source.repository}`);
  }
  return [{ id: branch, ref: branch, sha: ref.sha, release: '' }];
}

export interface SyncOptions {
  /** Re-download every version even if the commit didn't change. */
  force?: boolean;
  log?: (message: string) => void;
}

/**
 * syncSources resolves the versions of every documentation source and downloads the ones that changed since the
 * last synchronization. When the network is not available, the previous synchronization is kept.
 */
export async function syncSources({ force = false, log = console.log }: SyncOptions = {}): Promise<Manifest> {
  const config = loadConfig();
  const previous = readManifest();
  const sources: Record<string, ManifestSource> = {};

  await Promise.all(
    config.docs.sources.map(async (source) => {
      let resolved: Omit<ManifestVersion, 'dir'>[];
      try {
        resolved = await resolveSource(source);
      } catch (error) {
        const fallback = previous?.sources[source.id];
        if (fallback === undefined) {
          throw error;
        }
        log(`⚠ ${source.id}: unable to resolve versions, keeping the previous synchronization (${String(error)})`);
        sources[source.id] = fallback;
        return;
      }
      const versions = await Promise.all(
        resolved.map(async (version) => {
          const destination = join(sourcesCacheDir(), source.id, version.id);
          const dir = relative(rootDir(), destination);
          const before = previous?.sources[source.id]?.versions.find((v) => v.id === version.id);
          if (!force && before?.sha === version.sha && existsSync(destination)) {
            log(`✓ ${source.id} ${version.id} up to date (${version.ref})`);
            return { ...version, dir };
          }
          log(`↓ ${source.id} ${version.id} from ${version.ref} (${version.sha.slice(0, 7)})`);
          await downloadDocs(source, version.sha, destination);
          return { ...version, dir };
        }),
      );
      sources[source.id] = { id: source.id, versioned: source.versioning !== undefined, versions };
    }),
  );

  const manifest: Manifest = { generatedAt: new Date().toISOString(), sources };
  await mkdir(sourcesCacheDir(), { recursive: true });
  await writeFile(manifestPath(), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
