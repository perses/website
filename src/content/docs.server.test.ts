import { describe, expect, it } from 'vitest';
import { createDocsUrlResolver, type DocsVersion, type PageFile, slugFromPath } from './docs.server';

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
