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

/**
 * A version of a versioned documentation source, resolved from the git references of its repository.
 */
export interface ResolvedVersion {
  /** Minor version, e.g. `v0.55`. Used in URLs. */
  id: string;
  /** Git reference used to fetch the docs: the release branch when it exists, the latest patch tag otherwise. */
  ref: string;
  /** Commit sha pointed by `ref`. */
  sha: string;
  /** Latest released patch tag of this minor version, e.g. `v0.55.1`. */
  release: string;
}

export interface GitRef {
  name: string;
  sha: string;
}

interface Semver {
  major: number;
  minor: number;
  patch: number;
}

const tagRegexp = /^v(\d+)\.(\d+)\.(\d+)$/;

/**
 * parseLsRemote parses the output of `git ls-remote`. For annotated tags, the peeled reference (`^{}`) points to
 * the commit, so it takes precedence over the tag object.
 */
export function parseLsRemote(output: string): GitRef[] {
  const refs = new Map<string, string>();
  for (const line of output.split('\n')) {
    const [sha, fullName] = line.trim().split(/\s+/);
    if (!sha || !fullName) {
      continue;
    }
    const peeled = fullName.endsWith('^{}');
    const name = fullName
      .replace(/\^\{\}$/, '')
      .replace(/^refs\/tags\//, '')
      .replace(/^refs\/heads\//, '');
    if (peeled || !refs.has(name)) {
      refs.set(name, sha);
    }
  }
  return [...refs.entries()].map(([name, sha]) => ({ name, sha }));
}

export function parseMinorVersion(version: string): { major: number; minor: number } {
  const match = /^v(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`invalid minor version "${version}", expected vX.Y`);
  }
  return { major: Number(match[1]), minor: Number(match[2]) };
}

function branchRegexp(template: string): RegExp {
  const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `^${escaped.replace('\\{major\\}', '(?<major>\\d+)').replace('\\{minor\\}', '(?<minor>\\d+)')}$`,
  );
}

function compareSemver(a: Semver, b: Semver): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

/**
 * resolveVersions computes the list of published versions of a source, sorted from the most recent to the oldest.
 * Only minor versions having at least one final release (no pre-release) are published, so a release branch
 * created for a release candidate doesn't appear before the release is out.
 * Without releaseBranch, every version is taken from its latest patch tag.
 */
export function resolveVersions(
  refs: GitRef[],
  options: { minVersion: string; releaseBranch?: string },
): ResolvedVersion[] {
  const min = parseMinorVersion(options.minVersion);
  const branchMatcher = options.releaseBranch === undefined ? undefined : branchRegexp(options.releaseBranch);
  const latestTags = new Map<string, { semver: Semver; ref: GitRef }>();
  const branches = new Map<string, GitRef>();

  for (const ref of refs) {
    const tag = tagRegexp.exec(ref.name);
    if (tag) {
      const semver = { major: Number(tag[1]), minor: Number(tag[2]), patch: Number(tag[3]) };
      if (compareSemver(semver, { ...min, patch: 0 }) < 0) {
        continue;
      }
      const id = `v${semver.major}.${semver.minor}`;
      const current = latestTags.get(id);
      if (current === undefined || compareSemver(semver, current.semver) > 0) {
        latestTags.set(id, { semver, ref });
      }
      continue;
    }
    const branch = branchMatcher?.exec(ref.name);
    if (branch?.groups) {
      branches.set(`v${Number(branch.groups.major)}.${Number(branch.groups.minor)}`, ref);
    }
  }

  return [...latestTags.entries()]
    .toSorted(([, a], [, b]) => compareSemver(b.semver, a.semver))
    .map(([id, { ref: tag }]) => {
      const branch = branches.get(id);
      return {
        id,
        ref: branch?.name ?? tag.name,
        sha: branch?.sha ?? tag.sha,
        release: tag.name,
      };
    });
}
