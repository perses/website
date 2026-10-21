import ArrowBack from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { data, Link as RouterLink } from 'react-router';
import { BlogPostMeta } from '../../components/BlogPostMeta/BlogPostMeta';
import { Markdown } from '../../components/Markdown/Markdown';
import { NotFound } from '../../components/NotFound/NotFound';
import { TableOfContents } from '../../components/TableOfContents/TableOfContents';
import { loadPost } from '../../content/blog.server';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import { LATEST_SCOPE } from '../../utils/search';
import type { Route } from './+types/BlogPost';

export async function loader({ params }: Route.LoaderArgs) {
  const post = await loadPost(params.year, params.month, params.day, params.slug);
  if (post === undefined) {
    throw data(null, { status: 404 });
  }
  return post;
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (loaderData === undefined) {
    return [];
  }
  return [
    ...pageMeta({
      title: loaderData.title,
      description: loaderData.description,
      canonical: loaderData.url,
      siteUrl: siteUrlFrom(matches),
      type: 'article',
    }),
    { property: 'article:published_time', content: loaderData.date },
  ];
}

export function ErrorBoundary() {
  return <NotFound />;
}

export default function BlogPost({ loaderData: post }: Route.ComponentProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, px: { xs: 2, sm: 4 }, py: { xs: 4, md: 8 } }}>
      <Box component="article" sx={{ flexGrow: 1, minWidth: 0, maxWidth: 820 }} data-pagefind-body="">
        <Box hidden>
          <span data-pagefind-filter="section">Blog</span>
          <span data-pagefind-filter="source">blog</span>
          <span data-pagefind-filter="scope">{LATEST_SCOPE}</span>
        </Box>
        <Button component={RouterLink} to="/blog/" startIcon={<ArrowBack />} sx={{ mb: 3, px: 0 }} data-pagefind-ignore="">
          Back to the blog
        </Button>
        <Typography variant="h1" sx={{ mb: 2 }}>
          {post.title}
        </Typography>
        <Box sx={{ mb: 5 }} data-pagefind-ignore="">
          <BlogPostMeta post={post} />
        </Box>
        <Markdown hast={post.content.hast} />
      </Box>
      {post.content.toc.length > 0 && (
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: 240,
            flexShrink: 0,
            position: 'sticky',
            top: 88,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 104px)',
            overflowY: 'auto',
          }}
        >
          <TableOfContents items={post.content.toc} />
        </Box>
      )}
    </Box>
  );
}
