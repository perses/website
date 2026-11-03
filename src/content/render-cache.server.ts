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

// The render cache keeps the result of the most expensive steps of the build from one build to the next, in
// `.cache/render/`:
// - `markdown/`: the rendered markdown of the documentation pages, keyed by the content of the page, everything used to
//   resolve its links and the code of the markdown pipeline,
// - `pages/`: the prerendered HTML pages, keyed by the server build, the URL and the data of the loaders.
// An entry is a pure function of its key, so it is reused as is: only the pages whose content, data or code changed are
// rendered again. At the end of the build, the entries that were not used are removed.
import { createHash, type Hash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { cacheDir, rootDir } from './config.server.ts';

export type RenderCacheKind = 'markdown' | 'pages';

// Change it when the format of the entries changes, so the entries of the previous builds are ignored.
const formatVersion = '1';

const extensions: Record<RenderCacheKind, string> = { markdown: '.json', pages: '.html' };

export function renderCacheDir(): string {
  return join(cacheDir(), 'render');
}

function entryPath(kind: RenderCacheKind, key: string): string {
  return join(renderCacheDir(), kind, `${key}${extensions[kind]}`);
}

/**
 * renderCacheEnabled is true in the production build only: the dev server renders the content on every request.
 */
export function renderCacheEnabled(): boolean {
  return process.env.NODE_ENV === 'production';
}

export interface RenderCacheStats {
  reused: Record<RenderCacheKind, number>;
  rendered: Record<RenderCacheKind, number>;
}

const statsKey: unique symbol = Symbol.for('perses-website.render-cache-stats');

/**
 * renderCacheStats returns the number of entries reused and rendered by the current build. The server build
 * (prerendering) and the React Router config (end of the build) each load their own instance of this module, in the
 * same process: the statistics are stored in the global object.
 */
export function renderCacheStats(): RenderCacheStats {
  const store = globalThis as typeof globalThis & { [statsKey]?: RenderCacheStats };
  store[statsKey] ??= { reused: { markdown: 0, pages: 0 }, rendered: { markdown: 0, pages: 0 } };
  return store[statsKey];
}

let warned = false;

function warnCacheError(error: unknown) {
  if (!warned) {
    warned = true;
    console.warn(`⚠ unable to use the render cache (${String(error)})`);
  }
}

/**
 * readCacheEntry returns the content of an entry, or undefined when it doesn't exist.
 */
export function readCacheEntry(kind: RenderCacheKind, key: string): string | undefined {
  const path = entryPath(kind, key);
  let contents: string;
  try {
    contents = readFileSync(path, 'utf8');
  } catch {
    return undefined;
  }
  try {
    // The modification time marks the entries used by the current build, see pruneRenderCache.
    const now = new Date();
    utimesSync(path, now, now);
  } catch (error) {
    warnCacheError(error);
  }
  renderCacheStats().reused[kind]++;
  return contents;
}

/**
 * writeCacheEntry stores an entry. A failure is reported but doesn't fail the build: the cache is only an optimization.
 */
export function writeCacheEntry(kind: RenderCacheKind, key: string, contents: string): void {
  const path = entryPath(kind, key);
  // The entry is written in a temporary file then renamed, so an interrupted build never leaves a truncated entry.
  const temporary = `${path}.${process.pid}.tmp`;
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(temporary, contents);
    renameSync(temporary, path);
    renderCacheStats().rendered[kind]++;
  } catch (error) {
    try {
      rmSync(temporary, { force: true });
    } catch {
      // The original error is reported below.
    }
    warnCacheError(error);
  }
}

/**
 * pruneRenderCache removes the entries that were not used since the given time, by default the start of the process:
 * at the end of a build, only the entries used by this build are kept. It returns the number of removed entries.
 * A failure is reported but doesn't fail the build.
 */
export function pruneRenderCache(since = performance.timeOrigin): number {
  let removed = 0;
  for (const kind of Object.keys(extensions) as RenderCacheKind[]) {
    const dir = join(renderCacheDir(), kind);
    let files: string[];
    try {
      files = readdirSync(dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        warnCacheError(error);
      }
      continue;
    }
    for (const file of files) {
      const path = join(dir, file);
      try {
        // Margin for the file systems storing the modification time with a precision of one or two seconds.
        if (statSync(path).mtimeMs < since - 2000) {
          rmSync(path, { force: true });
          removed++;
        }
      } catch (error) {
        warnCacheError(error);
      }
    }
  }
  return removed;
}

export function hashOf(...parts: string[]): string {
  const hash = createHash('sha256');
  for (const part of parts) {
    hash.update(part);
    hash.update('\0');
  }
  return hash.digest('hex');
}

const ignoredFile = /\.test\.[jt]sx?$/;

function hashPath(hash: Hash, path: string) {
  let entries;
  try {
    entries = readdirSync(path, { withFileTypes: true });
  } catch {
    hash.update(`${relative(rootDir(), path)}\0`);
    try {
      hash.update(readFileSync(path));
    } catch {
      // A missing file is part of the fingerprint too.
    }
    hash.update('\0');
    return;
  }
  for (const entry of entries.toSorted((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    if (entry.isDirectory() || (entry.isFile() && !ignoredFile.test(entry.name))) {
      hashPath(hash, join(path, entry.name));
    }
  }
}

const fingerprints = new Map<string, string>();

/**
 * fingerprint hashes the files and the directories at the given paths (relative to the root of the website), without
 * the test files, with the version of Node.js. It is computed once per process.
 */
export function fingerprint(paths: string[]): string {
  const id = paths.join('\0');
  let result = fingerprints.get(id);
  if (result === undefined) {
    const hash = createHash('sha256');
    hash.update(`${formatVersion}\0${process.version}\0`);
    for (const path of paths) {
      hashPath(hash, resolve(rootDir(), path));
    }
    result = hash.digest('hex');
    fingerprints.set(id, result);
  }
  return result;
}

const undefinedValue = '\0undefined';

/**
 * plainValue is the replacer serializing the loader data in the key of a page. It throws when the serialization is not
 * exact: only the plain objects, the arrays and the JSON primitives are supported.
 */
function plainValue(this: unknown, key: string, value: unknown): unknown {
  // The value before the call of its toJSON method: a Date is converted to a string before reaching the replacer.
  const original = (this as Record<string, unknown>)[key];
  if (original === undefined) {
    // Keep the difference between a property set to undefined and a missing property.
    return undefinedValue;
  }
  if (original === undefinedValue) {
    throw new TypeError('unsupported string, reserved to represent undefined');
  }
  if (typeof original === 'function' || typeof original === 'symbol' || typeof original === 'bigint') {
    throw new TypeError(`unsupported value of type ${typeof original}`);
  }
  if (typeof original === 'number' && !Number.isFinite(original)) {
    throw new TypeError(`unsupported number ${original}`);
  }
  if (typeof original === 'object' && original !== null) {
    const prototype: unknown = Object.getPrototypeOf(original);
    if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) {
      throw new TypeError('unsupported object, only the plain objects and the arrays are supported');
    }
  }
  return value;
}

/**
 * pageCacheKey identifies a prerendered page: the server build (all the code of the website, and the names of the
 * client assets), the dependencies, the path, the status and the data of the loaders. It returns undefined when the
 * data can't be serialized exactly (class instances, promises...): the page is then always rendered.
 */
export function pageCacheKey(serverBuildDir: string, path: string, status: number, data: unknown): string | undefined {
  let serialized: string;
  try {
    serialized = JSON.stringify(data, plainValue);
  } catch {
    return undefined;
  }
  return hashOf(fingerprint([serverBuildDir, 'pnpm-lock.yaml']), path, String(status), serialized);
}
