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

import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router';
import type { NavNode } from '../../content/types';
import { siblings } from '../../utils/nav';

export interface PageNavigationProps {
  nav: NavNode[];
  pathname: string;
  prefix: string;
}

/**
 * PageNavigation links to the previous and the next pages of the documentation.
 */
export function PageNavigation({ nav, pathname, prefix }: PageNavigationProps) {
  const { previous, next } = siblings(nav, pathname, prefix);
  if (previous === undefined && next === undefined) {
    return null;
  }
  return (
    <Box
      component="nav"
      aria-label="Previous and next pages"
      sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2, pt: 3, borderTop: 1, borderColor: 'divider' }}
    >
      {previous?.href !== undefined ? (
        <Button component={RouterLink} to={previous.href} startIcon={<ArrowBack />} sx={{ textAlign: 'left' }}>
          {previous.title}
        </Button>
      ) : (
        <span />
      )}
      {next?.href !== undefined && (
        <Button component={RouterLink} to={next.href} endIcon={<ArrowForward />} sx={{ textAlign: 'right' }}>
          {next.title}
        </Button>
      )}
    </Box>
  );
}
