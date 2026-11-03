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
  serverBuildFingerprint,
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

function pageWithToJSON(title: string) {
  const page = { title };
  Object.defineProperty(page, 'toJSON', { value: () => 'constant' });
  return { loaderData: { page } };
}

// The declaration of the prerendered paths, as written by React Router in the server build.
function prerender(paths: string[]): string {
  return `var prerender = [\n${paths.map((path) => `\t${JSON.stringify(path)}`).join(',\n')}\n];`;
}

describe('serverBuildFingerprint', () => {
  const roots: string[] = [];

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }));
  });

  // Each server build is in `build/server` of its own website root, as the location of the files is hashed too.
  function serverBuild(code: string): string {
    const root = mkdtempSync(join(tmpdir(), 'perses-website-server-build-'));
    roots.push(root);
    vi.stubEnv('WEBSITE_ROOT', root);
    const dir = join(root, 'build', 'server');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.js'), code);
    return dir;
  }

  it('ignores the list of the prerendered paths', () => {
    const reference = serverBuildFingerprint(serverBuild(`var ssr = false;\n${prerender(['/', '/docs/'])}\nexport { prerender };\n`));
    const withNewPost = `var ssr = false;\n${prerender(['/', '/docs/', '/blog/2026/11/03/new-post/'])}\nexport { prerender };\n`;

    expect(serverBuildFingerprint(serverBuild(withNewPost))).toBe(reference);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('changes with the code of the server build', () => {
    const reference = serverBuildFingerprint(serverBuild(`var ssr = false;\n${prerender(['/'])}\nexport { prerender };\n`));

    expect(serverBuildFingerprint(serverBuild(`var ssr = true;\n${prerender(['/'])}\nexport { prerender };\n`))).not.toBe(
      reference,
    );
  });

  it('hashes the whole server build when the list of the prerendered paths is not found', () => {
    const reference = serverBuildFingerprint(serverBuild('var prerender = ["/"].concat(paths);\n'));

    expect(serverBuildFingerprint(serverBuild('var prerender = ["/docs/"].concat(paths);\n'))).not.toBe(reference);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('list of the prerendered paths was not found'));
  });
});

describe('pageCacheKey', () => {
  const serverBuildDir = join(tmpdir(), 'perses-website-missing-server-build');

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(key('/docs/', 200, { loaderData: { date: new Date(0) } })).toBeUndefined();
    expect(key('/docs/', 200, { loaderData: { page: { title: 'Overview', toJSON: () => 'constant' } } })).toBeUndefined();
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(key('/docs/', 200, { loaderData: circular })).toBeUndefined();
  });

  it('distinguishes the values that JSON.stringify confuses', () => {
    const withHole: unknown[] = [];
    withHole.length = 1;
    const value = (v: unknown) => key('/docs/', 200, { loaderData: { value: v } });
    const keys = [
      key('/docs/', 200, { loaderData: {} }),
      value(undefined),
      value('\0undefined'),
      value(null),
      value(Number.NaN),
      value(Number.POSITIVE_INFINITY),
      value(0),
      value(-0),
      value('0'),
      value([undefined]),
      value(withHole),
      value({}),
      value(Object.create(null)),
    ];
    expect(keys).not.toContain(undefined);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('ignores toJSON, which could hide the content of a value', () => {
    // React Router doesn't call toJSON: the title is serialized in the page.
    expect(key('/docs/', 200, pageWithToJSON('Overview'))).not.toBe(key('/docs/', 200, pageWithToJSON('Concepts')));
  });
});
