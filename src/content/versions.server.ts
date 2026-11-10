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
  /**
   * Git reference used to fetch the docs: the release branch when it exists, the latest patch tag otherwise (the
   * latest pre-release tag for a preview).
   */
  ref: string;
  /** Commit sha pointed by `ref`. */
  sha: string;
  /** Latest released patch tag of this minor version, e.g. `v0.55.1`. For a preview, its latest pre-release tag. */
  release: string;
  /** True for the preview of the next minor version, which has pre-releases only (e.g. `v0.56.0-rc.0`). */
  preview?: boolean;
}

export interface GitRef {
  name: string;
  sha: string;
}

interface Semver {
  major: number;
  minor: number;
  patch: number;
  /** Pre-release identifiers, e.g. `beta.1`. Undefined for a final release. */
  prerelease?: string;
}

const tagRegexp = /^v(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

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

function compareMinor(a: Pick<Semver, 'major' | 'minor'>, b: Pick<Semver, 'major' | 'minor'>): number {
  return a.major - b.major || a.minor - b.minor;
}

const numericIdentifier = /^\d+$/;

/**
 * comparePrerelease follows the precedence rules of semver: `alpha.1` < `beta.0` < `beta.2` < `beta.10` < `rc.0` <
 * the final release (no pre-release).
 */
function comparePrerelease(a: string | undefined, b: string | undefined): number {
  if (a === b) {
    return 0;
  }
  if (a === undefined || b === undefined) {
    return a === undefined ? 1 : -1;
  }
  const left = a.split('.');
  const right = b.split('.');
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    const x = left[i] ?? '';
    const y = right[i] ?? '';
    if (x === y) {
      continue;
    }
    const xNumeric = numericIdentifier.test(x);
    const yNumeric = numericIdentifier.test(y);
    if (xNumeric && yNumeric) {
      return Number(x) - Number(y);
    }
    if (xNumeric !== yNumeric) {
      // Numeric identifiers have a lower precedence than alphanumeric ones.
      return xNumeric ? -1 : 1;
    }
    return x < y ? -1 : 1;
  }
  return left.length - right.length;
}

function compareSemver(a: Semver, b: Semver): number {
  return compareMinor(a, b) || a.patch - b.patch || comparePrerelease(a.prerelease, b.prerelease);
}

interface LatestTag {
  semver: Semver;
  ref: GitRef;
}

/**
 * resolveVersions computes the list of published versions of a source, sorted from the most recent to the oldest.
 * Only minor versions having at least one final release (no pre-release) are published, so a release branch
 * created for a release candidate doesn't appear before the release is out.
 * With `preview`, the next minor version is also published while it has pre-releases only (beta, release
 * candidate...), flagged as preview: it is the most recent minor version having a pre-release, when it is more recent
 * than every released version, or when no version is released yet.
 * Without releaseBranch, every version is taken from its latest patch tag (pre-release tag for the preview).
 */
export function resolveVersions(
  refs: GitRef[],
  options: { minVersion: string; releaseBranch?: string; preview?: boolean },
): ResolvedVersion[] {
  const min = parseMinorVersion(options.minVersion);
  const branchMatcher = options.releaseBranch === undefined ? undefined : branchRegexp(options.releaseBranch);
  // Latest final release and latest pre-release of each minor version.
  const releases = new Map<string, LatestTag>();
  const prereleases = new Map<string, LatestTag>();
  const branches = new Map<string, GitRef>();

  for (const ref of refs) {
    const tag = tagRegexp.exec(ref.name);
    if (tag) {
      const semver = { major: Number(tag[1]), minor: Number(tag[2]), patch: Number(tag[3]), prerelease: tag[4] };
      if (compareMinor(semver, min) < 0) {
        continue;
      }
      const id = `v${semver.major}.${semver.minor}`;
      const latestTags = semver.prerelease === undefined ? releases : prereleases;
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

  const toVersion = (id: string, tag: GitRef): ResolvedVersion => {
    const branch = branches.get(id);
    return { id, ref: branch?.name ?? tag.name, sha: branch?.sha ?? tag.sha, release: tag.name };
  };
  const released = [...releases.entries()].toSorted(([, a], [, b]) => compareSemver(b.semver, a.semver));
  const versions = released.map(([id, { ref }]) => toVersion(id, ref));
  if (!options.preview) {
    return versions;
  }
  // The pre-releases of a minor version that was never released are ignored once a more recent version is released.
  const latestRelease = released[0]?.[1].semver;
  let next: [string, LatestTag] | undefined;
  for (const entry of prereleases) {
    const { semver } = entry[1];
    const unreleased = latestRelease === undefined || compareMinor(semver, latestRelease) > 0;
    if (unreleased && (next === undefined || compareMinor(semver, next[1].semver) > 0)) {
      next = entry;
    }
  }
  return next === undefined ? versions : [{ ...toVersion(next[0], next[1].ref), preview: true }, ...versions];
}
