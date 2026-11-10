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
import { parseLsRemote, resolveVersions } from './versions.server';

const lsRemote = `
aaa1\trefs/heads/main
bbb1\trefs/heads/release/v0.55
ccc1\trefs/heads/release/v0.54
ddd1\trefs/heads/release/v0.56
eee1\trefs/tags/v0.55.0
eee2\trefs/tags/v0.55.0^{}
fff1\trefs/tags/v0.55.1
ggg1\trefs/tags/v0.54.0
hhh1\trefs/tags/v0.53.0
hhh2\trefs/tags/v0.53.2
iii1\trefs/tags/v0.52.0
jjj1\trefs/tags/v0.56.0-rc.0
kkk1\trefs/tags/v0.56.0-beta.1
`;

describe('parseLsRemote', () => {
  it('uses the peeled commit of annotated tags', () => {
    const refs = parseLsRemote(lsRemote);
    expect(refs.find((ref) => ref.name === 'v0.55.0')).toEqual({ name: 'v0.55.0', sha: 'eee2' });
    expect(refs.find((ref) => ref.name === 'release/v0.55')).toEqual({ name: 'release/v0.55', sha: 'bbb1' });
  });
});

describe('resolveVersions', () => {
  const refs = parseLsRemote(lsRemote);

  it('publishes the minor versions having a final release, from the most recent', () => {
    const versions = resolveVersions(refs, { minVersion: 'v0.53', releaseBranch: 'release/v{major}.{minor}' });
    expect(versions.map((v) => v.id)).toEqual(['v0.55', 'v0.54', 'v0.53']);
  });

  it('uses the release branch when it exists, the latest patch tag otherwise', () => {
    const versions = resolveVersions(refs, { minVersion: 'v0.53', releaseBranch: 'release/v{major}.{minor}' });
    expect(versions).toEqual([
      { id: 'v0.55', ref: 'release/v0.55', sha: 'bbb1', release: 'v0.55.1' },
      { id: 'v0.54', ref: 'release/v0.54', sha: 'ccc1', release: 'v0.54.0' },
      { id: 'v0.53', ref: 'v0.53.2', sha: 'hhh2', release: 'v0.53.2' },
    ]);
  });

  it('ignores the release branches of versions not released yet', () => {
    const versions = resolveVersions(refs, { minVersion: 'v0.50', releaseBranch: 'release/v{major}.{minor}' });
    expect(versions.map((v) => v.id)).not.toContain('v0.56');
    expect(versions.map((v) => v.id)).toContain('v0.52');
  });

  it('supports other release branch naming conventions', () => {
    const versions = resolveVersions(parseLsRemote('a\trefs/tags/v1.2.0\nb\trefs/heads/release-1.2'), {
      minVersion: 'v1.0',
      releaseBranch: 'release-{major}.{minor}',
    });
    expect(versions).toEqual([{ id: 'v1.2', ref: 'release-1.2', sha: 'b', release: 'v1.2.0' }]);
  });

  it('uses the latest patch tag of every version without release branch', () => {
    const versions = resolveVersions(refs, { minVersion: 'v0.54' });
    expect(versions).toEqual([
      { id: 'v0.55', ref: 'v0.55.1', sha: 'fff1', release: 'v0.55.1' },
      { id: 'v0.54', ref: 'v0.54.0', sha: 'ggg1', release: 'v0.54.0' },
    ]);
  });

  it('rejects an invalid minimum version', () => {
    expect(() => resolveVersions(refs, { minVersion: '0.53', releaseBranch: 'release/v{major}.{minor}' })).toThrow('invalid minor version');
  });

  describe('with preview', () => {
    const options = { minVersion: 'v0.53', releaseBranch: 'release/v{major}.{minor}', preview: true };

    it('publishes first the next minor version having pre-releases only, from its release branch', () => {
      const versions = resolveVersions(refs, options);
      expect(versions.map((v) => v.id)).toEqual(['v0.56', 'v0.55', 'v0.54', 'v0.53']);
      expect(versions[0]).toEqual({ id: 'v0.56', ref: 'release/v0.56', sha: 'ddd1', release: 'v0.56.0-rc.0', preview: true });
      expect(versions.slice(1).some((v) => v.preview)).toBe(false);
    });

    it('uses the latest pre-release tag without release branch, following the semver precedence', () => {
      const prereleases = parseLsRemote(
        ['a\trefs/tags/v0.55.0', 'b\trefs/tags/v0.56.0-beta.10', 'c\trefs/tags/v0.56.0-beta.9', 'd\trefs/tags/v0.56.0-alpha.0'].join('\n'),
      );
      expect(resolveVersions(prereleases, { minVersion: 'v0.55', preview: true })[0]).toEqual({
        id: 'v0.56',
        ref: 'v0.56.0-beta.10',
        sha: 'b',
        release: 'v0.56.0-beta.10',
        preview: true,
      });
      const withRc = parseLsRemote(['a\trefs/tags/v0.55.0', 'b\trefs/tags/v0.56.0-beta.10', 'e\trefs/tags/v0.56.0-rc.0'].join('\n'));
      expect(resolveVersions(withRc, { minVersion: 'v0.55', preview: true })[0]?.release).toBe('v0.56.0-rc.0');
    });

    it('stops the preview once the version is released', () => {
      const released = parseLsRemote(`${lsRemote}\nlll1\trefs/tags/v0.56.0`);
      const versions = resolveVersions(released, options);
      expect(versions[0]).toEqual({ id: 'v0.56', ref: 'release/v0.56', sha: 'ddd1', release: 'v0.56.0' });
      expect(versions.some((v) => v.preview)).toBe(false);
    });

    it('ignores the pre-releases of the versions older than the latest release', () => {
      const older = parseLsRemote(
        ['a\trefs/tags/v0.55.0', 'b\trefs/tags/v0.55.1-rc.0', 'c\trefs/tags/v0.54.0-rc.0', 'd\trefs/heads/release/v0.54'].join('\n'),
      );
      expect(resolveVersions(older, { ...options, minVersion: 'v0.50' })).toEqual([
        { id: 'v0.55', ref: 'v0.55.0', sha: 'a', release: 'v0.55.0' },
      ]);
    });

    it('publishes the most recent unreleased version, including a new major version', () => {
      const major = parseLsRemote(['a\trefs/tags/v0.55.0', 'b\trefs/tags/v0.56.0-rc.0', 'c\trefs/tags/v1.0.0-beta.0'].join('\n'));
      expect(resolveVersions(major, { minVersion: 'v0.55', preview: true }).map((v) => v.id)).toEqual(['v1.0', 'v0.55']);
    });

    it('publishes the preview of the first version, before any release', () => {
      const firstBetas = parseLsRemote(['a\trefs/tags/v0.1.0-beta.1', 'b\trefs/tags/v0.1.0-beta.2'].join('\n'));
      expect(resolveVersions(firstBetas, { minVersion: 'v0.1', preview: true })).toEqual([
        { id: 'v0.1', ref: 'v0.1.0-beta.2', sha: 'b', release: 'v0.1.0-beta.2', preview: true },
      ]);
    });
  });
});
