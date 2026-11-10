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

import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDocsUrlResolver,
  type DocsVersion,
  listDocsPaths,
  listSourceSummaries,
  loadDocsPage,
  type PageFile,
  renderDocsPage,
  slugFromPath,
} from './docs.server';
import { loadManifest } from './manifest.server';
import { renderCacheStats } from './render-cache.server';
import type { DocsPageData } from './types';

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

const previewConfig = (preview: boolean) => `
site:
  title: Perses
  description: Dashboards
  url: https://perses.dev
  repository: https://github.com/perses/website
menu: []
docs:
  sources:
    - id: perses
      title: Perses
      description: The Perses server.
      repository: perses/perses
      versioning:
        minVersion: v0.54
        releaseBranch: release/v{major}.{minor}
        preview: ${preview}
blog:
  title: Blog
  description: Blog
footer:
  trademark: Trademark
  links: []
downloads:
  binaries: []
  plugins:
    repository: perses/plugins
`;

// The prerendering fails on a page not found: every listed path of the documentation must be a page or a redirection.
async function expectPrerenderable() {
  const paths = listDocsPaths().filter((path) => path.startsWith('/docs/perses/'));
  const routes = await Promise.all(
    paths.map(async (path) => {
      const [, source = '', splat = ''] = /^\/docs\/([a-z0-9-]+)\/(.*)$/.exec(path) ?? [];
      return { path, data: await loadDocsPage(source, splat) };
    }),
  );
  expect(paths.length).toBeGreaterThan(1);
  expect(routes.filter(({ data }) => data === undefined).map(({ path }) => path)).toEqual([]);
}

describe('preview of the next version', () => {
  let root: string;

  function writeVersion(id: string, slugs: string[]) {
    const dir = join(root, 'docs', id);
    mkdirSync(dir, { recursive: true });
    for (const slug of slugs) {
      writeFileSync(join(dir, `${slug}.md`), `# ${slug} ${id}\n`);
    }
    writeFileSync(join(dir, 'nav.yaml'), slugs.map((slug) => `- ${slug}.md`).join('\n'));
  }

  const preview = { id: 'v0.56', ref: 'release/v0.56', sha: 'c', release: 'v0.56.0-rc.1', preview: true, dir: 'docs/v0.56' };

  function writeManifest(versions: object[]) {
    mkdirSync(join(root, '.cache', 'sources'), { recursive: true });
    writeFileSync(
      join(root, '.cache', 'sources', 'manifest.json'),
      JSON.stringify({ generatedAt: '', sources: { perses: { id: 'perses', versioned: true, versions } } }),
    );
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'perses-website-preview-'));
    vi.stubEnv('WEBSITE_ROOT', root);
    // The configuration and the manifest are read again on every call, as with the dev server.
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('WEBSITE_LOCAL_SOURCES', '');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    writeFileSync(join(root, 'website.yaml'), previewConfig(true));
    writeVersion('v0.56', ['overview', 'new-feature']);
    writeVersion('v0.55', ['overview']);
    writeVersion('v0.54', ['overview']);
    writeManifest([
      preview,
      { id: 'v0.55', ref: 'release/v0.55', sha: 'b', release: 'v0.55.1', dir: 'docs/v0.55' },
      { id: 'v0.54', ref: 'release/v0.54', sha: 'a', release: 'v0.54.0', dir: 'docs/v0.54' },
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(root, { recursive: true, force: true });
  });

  it('keeps the latest release as the latest version', async () => {
    expect(await loadDocsPage('perses', '')).toEqual({ to: '/docs/perses/latest/overview/' });
    const data = (await loadDocsPage('perses', 'latest/overview')) as DocsPageData;
    expect(data).toMatchObject({ resolvedVersion: 'v0.55', isLatest: true, prerelease: undefined });
    expect(data.versions).toEqual([
      { id: 'v0.56', label: 'v0.56 (preview)', href: '/docs/perses/v0.56/overview/', latest: false },
      { id: 'v0.55', label: 'v0.55 (latest)', href: '/docs/perses/latest/overview/', latest: true },
      { id: 'v0.54', label: 'v0.54', href: '/docs/perses/v0.54/overview/', latest: false },
    ]);
    expect(listSourceSummaries()[0]?.latestRelease).toBe('v0.55.1');
  });

  it('publishes the preview under its version', async () => {
    const data = (await loadDocsPage('perses', 'v0.56/new-feature')) as DocsPageData;
    expect(data).toMatchObject({
      resolvedVersion: 'v0.56',
      isLatest: false,
      prerelease: 'v0.56.0-rc.1',
      canonical: '/docs/perses/v0.56/new-feature/',
    });
    // The page doesn't exist in the released versions: the selector links to their first page.
    expect(data.versions.map((v) => v.href)).toEqual([
      '/docs/perses/v0.56/new-feature/',
      '/docs/perses/latest/overview/',
      '/docs/perses/v0.54/overview/',
    ]);
    expect(listDocsPaths()).toContain('/docs/perses/v0.56/new-feature/');
    expect(listDocsPaths()).not.toContain('/docs/perses/latest/new-feature/');
    await expectPrerenderable();
  });

  it('leads to the preview while no version is released', async () => {
    writeManifest([preview]);
    expect(await loadDocsPage('perses', '')).toEqual({ to: '/docs/perses/v0.56/overview/' });
    expect(await loadDocsPage('perses', 'overview')).toEqual({ to: '/docs/perses/v0.56/overview/' });
    expect(await loadDocsPage('perses', 'latest/overview')).toBeUndefined();
    const data = (await loadDocsPage('perses', 'v0.56/overview')) as DocsPageData;
    expect(data).toMatchObject({ resolvedVersion: 'v0.56', isLatest: false, prerelease: 'v0.56.0-rc.1' });
    expect(data.versions).toEqual([
      { id: 'v0.56', label: 'v0.56 (preview)', href: '/docs/perses/v0.56/overview/', latest: false },
    ]);
    expect(listSourceSummaries()).toMatchObject([{ href: '/docs/perses/v0.56/overview/', latestRelease: undefined }]);
    expect(listDocsPaths().some((path) => path.startsWith('/docs/perses/latest/'))).toBe(false);
    await expectPrerenderable();
  });

  it('hides the preview when the configuration does not enable it anymore', async () => {
    writeFileSync(join(root, 'website.yaml'), previewConfig(false));
    expect(await loadDocsPage('perses', 'v0.56/overview')).toBeUndefined();
    const data = (await loadDocsPage('perses', 'latest/overview')) as DocsPageData;
    expect(data.versions.map((v) => v.id)).toEqual(['v0.55', 'v0.54']);
  });

  it('hides a source left without version when the preview is disabled', async () => {
    writeManifest([preview]);
    writeFileSync(join(root, 'website.yaml'), previewConfig(false));
    expect(listDocsPaths().filter((path) => path.startsWith('/docs/perses/'))).toEqual([]);
    expect(listSourceSummaries()).toEqual([]);
    expect(await loadDocsPage('perses', '')).toBeUndefined();
  });

  it('replaces the latest version with a local clone, not the preview', () => {
    const clone = join(root, 'clone');
    vi.stubEnv('WEBSITE_LOCAL_SOURCES', `perses=${clone}`);
    expect(loadManifest().sources.perses?.versions.map((v) => [v.id, v.ref, v.dir])).toEqual([
      ['v0.56', 'release/v0.56', join(root, 'docs', 'v0.56')],
      ['v0.55', 'local', join(clone, 'docs')],
      ['v0.54', 'release/v0.54', join(root, 'docs', 'v0.54')],
    ]);
  });
});
