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

import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { cacheDir, loadConfig, rootDir, type SourceConfig } from './config.server.ts';

export interface ManifestVersion {
  /** `vX.Y` for versioned sources, the branch name otherwise. */
  id: string;
  ref: string;
  sha: string;
  /** Latest released tag of the version. Empty for not versioned sources. */
  release: string;
  /** Directory containing the markdown files, relative to the root of the website when it is inside it. */
  dir: string;
}

export interface ManifestSource {
  id: string;
  versioned: boolean;
  /** Versions sorted from the most recent to the oldest. The first one is the latest. */
  versions: ManifestVersion[];
}

export interface Manifest {
  generatedAt: string;
  sources: Record<string, ManifestSource>;
}

export function sourcesCacheDir(): string {
  return join(cacheDir(), 'sources');
}

export function manifestPath(): string {
  return join(sourcesCacheDir(), 'manifest.json');
}

/**
 * localOverrides parses the environment variable `WEBSITE_LOCAL_SOURCES`, a comma separated list of
 * `<source id>=<path to a local clone of the repository>`. It allows to work on the documentation of a repository
 * and see the result live in the website. For versioned sources, the local clone replaces the latest version.
 */
export function localOverrides(value = process.env.WEBSITE_LOCAL_SOURCES): Map<string, string> {
  const overrides = new Map<string, string>();
  for (const entry of (value ?? '').split(',')) {
    const [id, path] = entry.split('=').map((s) => s.trim());
    if (id && path) {
      overrides.set(id, isAbsolute(path) ? path : resolve(rootDir(), path));
    }
  }
  return overrides;
}

export function readManifest(): Manifest | undefined {
  const path = manifestPath();
  if (!existsSync(path)) {
    return undefined;
  }
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

function applyLocalOverride(source: ManifestSource, config: SourceConfig, localRepo: string): ManifestSource {
  const dir = join(localRepo, config.docsDir);
  const [latest, ...others] = source.versions;
  const local: ManifestVersion = {
    id: latest?.id ?? 'local',
    ref: 'local',
    sha: 'local',
    release: latest?.release ?? '',
    dir,
  };
  return { ...source, versions: [local, ...others] };
}

let cachedManifest: Manifest | undefined;

/**
 * loadManifest returns the list of sources and versions available locally, with the local overrides applied.
 * It throws when the content has never been synchronized.
 */
export function loadManifest(): Manifest {
  if (cachedManifest !== undefined && process.env.NODE_ENV !== 'development') {
    return cachedManifest;
  }
  const manifest = readManifest();
  if (manifest === undefined) {
    throw new Error('documentation sources not found, run "pnpm content:sync" first');
  }
  const overrides = localOverrides();
  const sources: Record<string, ManifestSource> = {};
  for (const config of loadConfig().docs.sources) {
    const source = manifest.sources[config.id];
    const local = overrides.get(config.id);
    if (source === undefined && local === undefined) {
      continue;
    }
    const base = source ?? { id: config.id, versioned: config.versioning !== undefined, versions: [] };
    const resolved = local ? applyLocalOverride(base, config, local) : base;
    sources[config.id] = {
      ...resolved,
      versions: resolved.versions.map((v) => ({ ...v, dir: isAbsolute(v.dir) ? v.dir : join(rootDir(), v.dir) })),
    };
  }
  cachedManifest = { ...manifest, sources };
  return cachedManifest;
}
