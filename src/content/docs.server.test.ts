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

import { mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDocsUrlResolver, type DocsVersion, type PageFile, renderDocsPage, slugFromPath } from './docs.server';
import { renderCacheStats } from './render-cache.server';

describe('slugFromPath', () => {
  it('removes the extension and the README/index file names', () => {
    expect(slugFromPath('concepts/dashboard.md')).toBe('concepts/dashboard');
    expect(slugFromPath('dac/cue/README.md')).toBe('dac/cue');
    expect(slugFromPath('index.md')).toBe('');
  });
});

const page = (relPath: string): PageFile => ({ relPath, slug: slugFromPath(relPath), absPath: `/tmp/${relPath}` });

describe('createDocsUrlResolver', () => {
  const pages = [page('concepts/dashboard.md'), page('configuration/configuration.md'), page('dac/go/README.md')];
  const version = {
    source: { id: 'perses', repository: 'perses/perses', docsDir: 'docs' },
    manifest: { id: 'v0.55', ref: 'release/v0.55', sha: 'abc', release: 'v0.55.0', dir: '/tmp' },
    versioned: true,
    isLatest: true,
    pages: new Map(pages.map((p) => [p.slug, p])),
    files: new Map(pages.map((p) => [p.relPath, p])),
    assets: new Set(['images/logo.png']),
    nav: [],
    navOrigin: 'test',
  } as unknown as DocsVersion;
  const resolve = createDocsUrlResolver(version, page('concepts/dashboard.md'), 'latest');

  it('rewrites the links to other pages of the same version', () => {
    expect(resolve('../configuration/configuration.md#datasource', 'link')).toBe(
      '/docs/perses/latest/configuration/configuration/#datasource',
    );
    expect(resolve('../dac/go/', 'link')).toBe('/docs/perses/latest/dac/go/');
  });

  it('serves the assets from the docs-assets directory of the version', () => {
    expect(resolve('../images/logo.png', 'asset')).toBe('/docs-assets/perses/v0.55/images/logo.png');
  });

  it('links to GitHub for the files outside of the documentation', () => {
    expect(resolve('../../ui/README.md', 'link')).toBe('https://github.com/perses/perses/blob/release/v0.55/ui/README.md');
  });

  it('leaves the anchors and the external links untouched', () => {
    expect(resolve('#section', 'link')).toBeUndefined();
    expect(resolve('https://example.com', 'link')).toBeUndefined();
  });
});

describe('renderDocsPage', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'perses-website-docs-'));
    vi.stubEnv('WEBSITE_ROOT', root);
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(root, { recursive: true, force: true });
  });

  it('reuses the rendered markdown of the previous builds while the page does not change', async () => {
    const overview = { relPath: 'overview.md', slug: 'overview', absPath: join(root, 'overview.md') };
    writeFileSync(overview.absPath, '# Overview\n\nSee [the guide](guide.md) and [this page](missing.md).\n');
    const version = {
      source: { id: 'perses', repository: 'perses/perses', docsDir: 'docs' },
      manifest: { id: 'v0.55', ref: 'release/v0.55', sha: 'abc', release: 'v0.55.0', dir: root },
      versioned: true,
      isLatest: true,
      pages: new Map([['overview', overview]]),
      files: new Map([['overview.md', overview]]),
      assets: new Set<string>(),
      nav: [],
      navOrigin: 'test',
    } as unknown as DocsVersion;
    const cacheEntries = () => readdirSync(join(root, '.cache', 'render', 'markdown'));

    const rendered = await renderDocsPage(version, overview, 'latest');
    expect(rendered.title).toBe('Overview');
    expect(cacheEntries()).toHaveLength(1);
    const entry = JSON.parse(readFileSync(join(root, '.cache', 'render', 'markdown', cacheEntries()[0] ?? ''), 'utf8'));
    expect(entry.warnings).toEqual([
      'perses v0.55 overview.md: broken link "guide.md"',
      'perses v0.55 overview.md: broken link "missing.md"',
    ]);

    // A new modification time bypasses the in-memory cache, as a new build would do.
    const reused = renderCacheStats().reused.markdown;
    const later = new Date(Date.now() + 5000);
    utimesSync(overview.absPath, later, later);
    expect(await renderDocsPage(version, overview, 'latest')).toEqual(rendered);
    expect(renderCacheStats().reused.markdown - reused).toBe(1);

    writeFileSync(overview.absPath, '# Overview of Perses\n');
    utimesSync(overview.absPath, new Date(Date.now() + 10_000), new Date(Date.now() + 10_000));
    expect((await renderDocsPage(version, overview, 'latest')).title).toBe('Overview of Perses');
    expect(cacheEntries()).toHaveLength(2);
  });
});
