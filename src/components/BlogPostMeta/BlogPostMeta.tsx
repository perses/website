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

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import type { BlogPostSummary } from '../../content/types';
import { blogCategoryUrl } from '../../utils/urls';

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * BlogPostMeta displays the date, the reading time, the authors and the categories of a blog post.
 */
export function BlogPostMeta({ post }: { post: BlogPostSummary }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
      <Typography variant="body2" color="text.secondary" component="span">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {' · '}
        {post.readingTime} min read
        {post.authors.length > 0 && ` · ${post.authors.join(', ')}`}
      </Typography>
      {post.categories.map((category) => (
        <Chip
          key={category.slug}
          label={category.name}
          size="small"
          component={RouterLink}
          to={blogCategoryUrl(category.slug)}
          clickable
        />
      ))}
    </Stack>
  );
}
