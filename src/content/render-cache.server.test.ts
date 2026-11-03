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

import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  pageCacheKey,
  pruneRenderCache,
  readCacheEntry,
  renderCacheDir,
  renderCacheStats,
  writeCacheEntry,
} from './render-cache.server';

describe('render cache entries', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'perses-website-render-cache-'));
    vi.stubEnv('WEBSITE_ROOT', root);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(root, { recursive: true, force: true });
  });

  it('reads the entries written before', () => {
    const { reused, rendered } = renderCacheStats();
    const before = { reused: reused.pages, rendered: rendered.pages };

    expect(readCacheEntry('pages', 'abc')).toBeUndefined();
    writeCacheEntry('pages', 'abc', '<html></html>');
    expect(readCacheEntry('pages', 'abc')).toBe('<html></html>');
    expect(readCacheEntry('markdown', 'abc')).toBeUndefined();

    expect(renderCacheStats().reused.pages - before.reused).toBe(1);
    expect(renderCacheStats().rendered.pages - before.rendered).toBe(1);
  });

  it('removes the entries that were not used since the given time', () => {
    writeCacheEntry('pages', 'unused', 'unused');
    writeCacheEntry('markdown', 'used', '{}');
    const old = new Date(Date.now() - 60_000);
    utimesSync(join(renderCacheDir(), 'pages', 'unused.html'), old, old);
    utimesSync(join(renderCacheDir(), 'markdown', 'used.json'), old, old);
    const since = Date.now() - 10_000;

    expect(readCacheEntry('markdown', 'used')).toBe('{}');
    expect(pruneRenderCache(since)).toBe(1);

    expect(existsSync(join(renderCacheDir(), 'pages', 'unused.html'))).toBe(false);
    expect(readCacheEntry('markdown', 'used')).toBe('{}');
  });

  it('continues without the cache when an entry cannot be written', () => {
    mkdirSync(renderCacheDir(), { recursive: true });
    // A file in place of the directory of the entries makes every write fail, even for root.
    writeFileSync(join(renderCacheDir(), 'pages'), '');

    expect(() => writeCacheEntry('pages', 'abc', '<html></html>')).not.toThrow();
    expect(readCacheEntry('pages', 'abc')).toBeUndefined();
  });

  it('continues to prune the other entries when an entry cannot be removed', () => {
    writeCacheEntry('pages', 'unused', 'unused');
    // A directory in place of an entry can't be removed by the pruning, even for root.
    const blocking = join(renderCacheDir(), 'pages', 'blocking.html');
    mkdirSync(blocking);
    writeFileSync(join(blocking, 'file'), '');
    const old = new Date(Date.now() - 60_000);
    utimesSync(join(renderCacheDir(), 'pages', 'unused.html'), old, old);
    utimesSync(blocking, old, old);

    expect(pruneRenderCache(Date.now() - 10_000)).toBe(1);
    expect(existsSync(join(renderCacheDir(), 'pages', 'unused.html'))).toBe(false);
  });
});

describe('pageCacheKey', () => {
  const serverBuildDir = join(tmpdir(), 'perses-website-missing-server-build');
  const key = (path: string, status: number, data: unknown) => pageCacheKey(serverBuildDir, path, status, data);
  const data = { loaderData: { 'pages/Layout/Layout': { menu: [{ title: 'Docs', href: '/docs/' }] } } };

  it('is the same for the same page', () => {
    expect(key('/docs/', 200, data)).toBe(key('/docs/', 200, structuredClone(data)));
  });

  it('changes with the path, the status and the data', () => {
    const reference = key('/docs/', 200, data);
    expect(key('/blog/', 200, data)).not.toBe(reference);
    expect(key('/docs/', 404, data)).not.toBe(reference);
    expect(key('/docs/', 200, { loaderData: { 'pages/Layout/Layout': { menu: [] } } })).not.toBe(reference);
    expect(key('/docs/', 200, { ...data, errors: undefined })).not.toBe(reference);
  });

  it('is undefined when the data cannot be serialized exactly', () => {
    expect(key('/docs/', 200, { loaderData: new Map() })).toBeUndefined();
    expect(key('/docs/', 200, { loaderData: { error: new Error('not found') } })).toBeUndefined();
    expect(key('/docs/', 200, { loaderData: { promise: Promise.resolve() } })).toBeUndefined();
    expect(key('/docs/', 200, { loaderData: { callback: () => undefined } })).toBeUndefined();
    expect(key('/docs/', 200, { loaderData: { count: Number.NaN } })).toBeUndefined();
    // A Date is converted to a string by its toJSON method: it would get the key of the string.
    expect(key('/docs/', 200, { loaderData: { date: new Date(0) } })).toBeUndefined();
  });

  it('is undefined when the data contains the string representing undefined', () => {
    expect(key('/docs/', 200, { loaderData: { value: '\0undefined' } })).toBeUndefined();
    expect(key('/docs/', 200, { loaderData: { value: undefined } })).toBeDefined();
  });
});
