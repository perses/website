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

import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router';

export interface VersionNoticeProps {
  /** Title of the documentation source, e.g. `Perses`. */
  source: string;
  /** Version of the page, e.g. `v0.54`. */
  version: string;
  /** Latest pre-release of the version when it is the preview of the next version, e.g. `v0.56.0-rc.1`. */
  prerelease?: string;
  /** Latest version, e.g. `v0.55`. */
  latestVersion?: string;
  /** URL of the page in the latest version. */
  latestHref: string;
}

/**
 * VersionNotice tells the readers that the page is not the documentation of the latest version: it is the
 * documentation of an older version, or the preview of the next version, which is not released yet.
 */
export function VersionNotice({ source, version, prerelease, latestVersion, latestHref }: VersionNoticeProps) {
  const latestLink = (
    <Link component={RouterLink} to={latestHref}>
      {/* The minor version, not the patch release: a patch release doesn't change the pages of the other versions. */}
      Go to the latest version{latestVersion === undefined ? '' : ` (${latestVersion})`}.
    </Link>
  );
  return prerelease === undefined ? (
    <Alert severity="warning" sx={{ mb: 3 }}>
      You are reading the documentation of {source} {version}. {latestLink}
    </Alert>
  ) : (
    <Alert severity="info" sx={{ mb: 3 }}>
      You are reading the documentation of {source} {version}, which is not released yet (latest pre-release:{' '}
      {prerelease}). {latestLink}
    </Alert>
  );
}
