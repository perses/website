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
import { refreshBinaries, refreshPlugins } from './githubReleases';
import type { BinaryRelease, GitHubRelease } from './releases';

const githubRelease = (tag: string, assets: string[] = []): GitHubRelease => ({
  tag_name: tag,
  name: tag,
  html_url: `https://github.com/perses/releases/tag/${tag}`,
  draft: false,
  prerelease: false,
  published_at: '2026-11-01T10:00:00Z',
  assets: assets.map((name) => ({ name, size: 1, browser_download_url: `https://example.com/${name}` })),
});

const config = { id: 'perses', title: 'Perses', description: '', repository: 'perses/perses', install: [] };
const built: BinaryRelease = { ...config, version: 'v0.55.0', date: '2026-10-21', url: '', assets: [] };

describe('refreshBinaries', () => {
  it('returns the newer releases', async () => {
    const updated = await refreshBinaries([config], [built], async () =>
      githubRelease('v0.56.0', ['perses_0.56.0_linux_amd64.tar.gz']),
    );
    expect(updated?.map((binary) => binary.version)).toEqual(['v0.56.0']);
  });

  it('returns undefined when the build is up to date or when GitHub fails', async () => {
    expect(await refreshBinaries([config], [built], async () => githubRelease('v0.55.0'))).toBeUndefined();
    expect(
      await refreshBinaries([config], [built], async () => {
        throw new Error('rate limited');
      }),
    ).toBeUndefined();
  });

  it('fills the binaries missing from the build', async () => {
    const updated = await refreshBinaries([config], undefined, async () => githubRelease('v0.55.0'));
    expect(updated?.map((binary) => binary.id)).toEqual(['perses']);
  });
});

describe('refreshPlugins', () => {
  const tempo = { id: 'tempo', name: 'Tempo', version: '0.60.0', date: '2026-10-21', url: '' };

  it('returns the plugins with the releases published since the build', async () => {
    const updated = await refreshPlugins('perses/plugins', [tempo], async () => [
      githubRelease('tempo/v0.61.0', ['Tempo-0.61.0.tar.gz']),
    ]);
    expect(updated?.map((plugin) => plugin.version)).toEqual(['0.61.0']);
  });

  it('returns undefined when nothing changed or when GitHub fails', async () => {
    expect(await refreshPlugins('perses/plugins', [tempo], async () => [githubRelease('tempo/v0.60.0')])).toBeUndefined();
    expect(
      await refreshPlugins('perses/plugins', [tempo], async () => {
        throw new Error('rate limited');
      }),
    ).toBeUndefined();
  });
});
