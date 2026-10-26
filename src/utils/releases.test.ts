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

import { describe, expect, it } from 'vitest';
import {
  compareVersions,
  latestPluginReleases,
  mergePluginReleases,
  parseAsset,
  renderInstallCommand,
  toBinaryRelease,
} from './releases';

const asset = (name: string, digest?: string) => ({
  name,
  size: 42,
  browser_download_url: `https://example.com/${name}`,
  digest,
});

describe('parseAsset', () => {
  it('extracts the platform and the checksum of an archive', () => {
    expect(parseAsset(asset('perses_0.55.0_linux_arm64.tar.gz', 'sha256:abc'))).toEqual({
      name: 'perses_0.55.0_linux_arm64.tar.gz',
      url: 'https://example.com/perses_0.55.0_linux_arm64.tar.gz',
      size: 42,
      sha256: 'abc',
      os: 'linux',
      arch: 'arm64',
      kind: 'archive',
    });
  });

  it('identifies the checksums file and the other files', () => {
    expect(parseAsset(asset('perses_0.55.0_checksums.txt')).kind).toBe('checksums');
    expect(parseAsset(asset('ui-sbom.cdx.json')).kind).toBe('other');
  });
});

const release = (tag: string, options: { prerelease?: boolean; assetName?: string } = {}) => ({
  tag_name: tag,
  name: tag,
  html_url: `https://github.com/perses/plugins/releases/tag/${tag}`,
  draft: false,
  prerelease: options.prerelease ?? false,
  published_at: '2026-10-21T09:54:08Z',
  assets: options.assetName ? [asset(options.assetName)] : [],
});

describe('latestPluginReleases', () => {
  it('keeps the latest final release of each plugin', () => {
    const plugins = latestPluginReleases([
      release('tempo/v0.59.0', { assetName: 'Tempo-0.59.0.tar.gz' }),
      release('tempo/v0.60.0', { assetName: 'Tempo-0.60.0.tar.gz' }),
      release('tempo/v0.61.0-rc.0', { prerelease: true }),
      release('timeserieschart/v0.14.0', { assetName: 'TimeSeriesChart-0.14.0.tar.gz' }),
      release('TimeSeriesChart-0.4.2'),
    ]);
    expect(plugins.map((p) => [p.id, p.name, p.version])).toEqual([
      ['tempo', 'Tempo', '0.60.0'],
      ['timeserieschart', 'TimeSeriesChart', '0.14.0'],
    ]);
  });
});

describe('compareVersions', () => {
  it('compares the versions with or without the v prefix', () => {
    expect(compareVersions('v0.56.0', 'v0.55.1')).toBeGreaterThan(0);
    expect(compareVersions('0.10.0', '0.9.9')).toBeGreaterThan(0);
    expect(compareVersions('v0.55.0', '0.55.0')).toBe(0);
  });
});

describe('renderInstallCommand', () => {
  it('replaces the version placeholders', () => {
    expect(renderInstallCommand('docker pull persesdev/perses:{version} # {versionNumber}', 'v0.56.0')).toBe(
      'docker pull persesdev/perses:v0.56.0 # 0.56.0',
    );
  });
});

describe('toBinaryRelease', () => {
  it('keeps the archives and the checksums of the release', () => {
    const binary = toBinaryRelease(
      { id: 'perses', title: 'Perses', description: '', repository: 'perses/perses', install: [] },
      {
        ...release('v0.56.0'),
        assets: [asset('perses_0.56.0_linux_amd64.tar.gz'), asset('perses_0.56.0_checksums.txt'), asset('ui-sbom.cdx.json')],
      },
    );
    expect(binary.version).toBe('v0.56.0');
    expect(binary.date).toBe('2026-10-21');
    expect(binary.assets.map((a) => a.kind)).toEqual(['archive', 'checksums']);
  });
});

describe('mergePluginReleases', () => {
  it('replaces the outdated plugins and adds the new ones', () => {
    const current = [
      { ...latestPluginReleases([release('tempo/v0.60.0', { assetName: 'Tempo-0.60.0.tar.gz' })])[0]!, extra: 'kept' },
      ...latestPluginReleases([release('loki/v0.7.0', { assetName: 'Loki-0.7.0.tar.gz' })]),
    ];
    const recent = latestPluginReleases([
      release('tempo/v0.61.0', { assetName: 'Tempo-0.61.0.tar.gz' }),
      release('loki/v0.6.0', { assetName: 'Loki-0.6.0.tar.gz' }),
      release('canvas/v0.1.0', { assetName: 'Canvas-0.1.0.tar.gz' }),
    ]);
    expect(mergePluginReleases(current, recent).map((p) => [p.name, p.version, 'extra' in p ? p.extra : undefined])).toEqual([
      ['Canvas', '0.1.0', undefined],
      ['Loki', '0.7.0', undefined],
      ['Tempo', '0.61.0', 'kept'],
    ]);
  });
});
