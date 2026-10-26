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
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import type { BlogArchiveYear } from '../../content/types';
import { formatDate } from '../BlogPostMeta/BlogPostMeta';

export interface BlogArchiveProps {
  archive: BlogArchiveYear[];
  /** URL of the post being read, highlighted in the list. */
  current?: string;
}

/**
 * BlogArchive lists every blog post, grouped by year, to find quickly a post.
 */
export function BlogArchive({ archive, current }: BlogArchiveProps) {
  return (
    <Box component="nav" aria-label="All posts">
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
        All posts
      </Typography>
      {archive.map((group) => (
        <Box key={group.year} sx={{ mt: 1.5 }}>
          <Typography variant="body2" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {group.year}
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderLeft: 1, borderColor: 'divider' }}>
            {group.posts.map((post) => {
              const active = post.url === current;
              return (
                <Box component="li" key={post.url} sx={{ py: 0.5, pl: 1.5 }}>
                  <Link
                    component={RouterLink}
                    to={post.url}
                    underline="hover"
                    color={active ? 'primary' : 'text.secondary'}
                    aria-current={active ? 'page' : undefined}
                    sx={{ display: 'block', fontSize: '0.8125rem', fontWeight: active ? 600 : 400 }}
                  >
                    {post.title}
                  </Link>
                  <Typography
                    component="time"
                    dateTime={post.date}
                    variant="caption"
                    sx={{ display: 'block', color: 'text.secondary', opacity: 0.7 }}
                  >
                    {formatDate(post.date)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
