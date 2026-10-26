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

  it('rejects an invalid minimum version', () => {
    expect(() => resolveVersions(refs, { minVersion: '0.53', releaseBranch: 'release/v{major}.{minor}' })).toThrow('invalid minor version');
  });
});
