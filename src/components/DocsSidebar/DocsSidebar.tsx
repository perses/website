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

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { NavNode, SourceSummary, VersionOption } from '../../content/types';
import { NavTree } from '../NavTree/NavTree';
import { SourceSelect } from '../SourceSelect/SourceSelect';
import { VersionSelect } from '../VersionSelect/VersionSelect';

export interface DocsSidebarProps {
  sources: SourceSummary[];
  source: string;
  versions: VersionOption[];
  version?: string;
  nav: NavNode[];
  pathname: string;
  onNavigate?: () => void;
}

export function DocsSidebar({ sources, source, versions, version, nav, pathname, onNavigate }: DocsSidebarProps) {
  return (
    <Box component="nav" aria-label="Documentation">
      <Stack spacing={2} sx={{ p: 2, pb: 1 }}>
        <SourceSelect sources={sources} current={source} onNavigate={onNavigate} />
        {versions.length > 0 && version !== undefined && <VersionSelect versions={versions} current={version} onNavigate={onNavigate} />}
      </Stack>
      <Box sx={{ px: 1, pb: 4 }}>
        <NavTree nodes={nav} pathname={pathname} onNavigate={onNavigate} />
      </Box>
    </Box>
  );
}
