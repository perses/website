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

import RssFeed from '@mui/icons-material/RssFeed';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { data, Link as RouterLink } from 'react-router';
import { BlogArchive } from '../../components/BlogArchive/BlogArchive';
import { BlogPostMeta } from '../../components/BlogPostMeta/BlogPostMeta';
import { Markdown } from '../../components/Markdown/Markdown';
import { NotFound } from '../../components/NotFound/NotFound';
import { loadBlogList } from '../../content/blog.server';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import { LATEST_SCOPE } from '../../utils/search';
import { blogCategoryUrl, blogUrl } from '../../utils/urls';
import type { Route } from './+types/Blog';

export async function loader({ params }: Route.LoaderArgs) {
  const page = params.page === undefined ? 1 : Number(params.page);
  const category = 'category' in params ? params.category : undefined;
  const list = await loadBlogList(page, category);
  if (list === undefined) {
    throw data(null, { status: 404 });
  }
  return list;
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (loaderData === undefined) {
    return [];
  }
  const url = loaderData.category === undefined ? blogUrl(loaderData.page) : blogCategoryUrl(loaderData.category.slug, loaderData.page);
  return [
    ...pageMeta({
      title: loaderData.category === undefined ? 'Blog' : `${loaderData.category.name} | Blog`,
      description: loaderData.description,
      canonical: url,
      siteUrl: siteUrlFrom(matches),
    }),
    ...(loaderData.category === undefined
      ? []
      : [
          {
            tagName: 'link',
            rel: 'alternate',
            type: 'application/rss+xml',
            title: `Perses Blog - ${loaderData.category.name}`,
            href: `${blogCategoryUrl(loaderData.category.slug)}rss.xml`,
          },
        ]),
  ];
}

export function ErrorBoundary() {
  return <NotFound />;
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { category, categories, posts, archive, page, totalPages } = loaderData;
  const pageUrl = (p: number) => (category === undefined ? blogUrl(p) : blogCategoryUrl(category.slug, p));
  const feed = category === undefined ? '/blog/rss.xml' : `${blogCategoryUrl(category.slug)}rss.xml`;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, px: { xs: 2, sm: 4 }, py: { xs: 4, md: 8 } }}>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: 820 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h1">{category === undefined ? 'Blog' : category.name}</Typography>
          <Button href={feed} startIcon={<RssFeed />} variant="outlined" size="small">
            RSS
          </Button>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {loaderData.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 5, flexWrap: 'wrap', rowGap: 1 }} component="nav" aria-label="Categories">
          <Chip label="All posts" component={RouterLink} to="/blog/" clickable color={category === undefined ? 'primary' : 'default'} />
          {categories.map((c) => (
            <Chip
              key={c.slug}
              label={`${c.name} (${c.count})`}
              component={RouterLink}
              to={c.url}
              clickable
              color={category?.slug === c.slug ? 'primary' : 'default'}
            />
          ))}
        </Stack>
        <Stack spacing={6} component="section" aria-label="Posts">
          {posts.map((post) => (
            <Box component="article" key={post.url} sx={{ pb: 6, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h2" sx={{ mb: 1 }}>
                <Link component={RouterLink} to={post.url} color="inherit">
                  {post.title}
                </Link>
              </Typography>
              <Box sx={{ mb: 2 }}>
                <BlogPostMeta post={post} />
              </Box>
              <Markdown hast={post.excerpt} />
              <Button component={RouterLink} to={post.url} sx={{ mt: 1, px: 0 }}>
                Continue reading →
              </Button>
            </Box>
          ))}
        </Stack>
        {totalPages > 1 && (
          <Pagination
            sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
            page={page}
            count={totalPages}
            renderItem={(item) => <PaginationItem component={RouterLink} to={pageUrl(item.page ?? 1)} {...item} />}
          />
        )}
        <span hidden data-pagefind-filter="scope">
          {LATEST_SCOPE}
        </span>
      </Box>
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: 260,
          flexShrink: 0,
          position: 'sticky',
          top: 88,
          alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 104px)',
          overflowY: 'auto',
        }}
      >
        <BlogArchive archive={archive} />
      </Box>
    </Box>
  );
}
