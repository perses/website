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
        <SourceSelect sources={sources} current={source} />
        {versions.length > 0 && version !== undefined && <VersionSelect versions={versions} current={version} />}
      </Stack>
      <Box sx={{ px: 1, pb: 4 }}>
        <NavTree nodes={nav} pathname={pathname} onNavigate={onNavigate} />
      </Box>
    </Box>
  );
}
