import EditOutlined from '@mui/icons-material/EditOutlined';
import MenuOpen from '@mui/icons-material/MenuOpen';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { data, Link as RouterLink, useLocation } from 'react-router';
import { DocsSidebar } from '../../components/DocsSidebar/DocsSidebar';
import { Markdown } from '../../components/Markdown/Markdown';
import { NotFound } from '../../components/NotFound/NotFound';
import { Redirect, redirectMeta } from '../../components/Redirect/Redirect';
import { TableOfContents } from '../../components/TableOfContents/TableOfContents';
import { loadDocsPage } from '../../content/docs.server';
import type { DocsPageData } from '../../content/types';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import { findTrail } from '../../utils/nav';
import { LATEST_SCOPE, versionScope } from '../../utils/search';
import { docsUrl, LATEST } from '../../utils/urls';
import type { Route } from './+types/DocsPage';
import { PageNavigation } from './PageNavigation';

export async function loader({ params }: Route.LoaderArgs) {
  const page = await loadDocsPage(params.source, params['*'] ?? '');
  if (page === undefined) {
    throw data(null, { status: 404 });
  }
  return page;
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  if (loaderData === undefined) {
    return [];
  }
  if ('to' in loaderData) {
    return redirectMeta(loaderData.to);
  }
  const title = loaderData.content.title;
  const version = loaderData.resolvedVersion === undefined ? '' : ` ${loaderData.resolvedVersion}`;
  return pageMeta({
    title: `${title} | ${loaderData.source.title}${version}`,
    description: loaderData.source.description,
    canonical: loaderData.canonical,
    siteUrl: siteUrlFrom(matches),
  });
}

export function ErrorBoundary() {
  return <NotFound />;
}

const SIDEBAR_WIDTH = 288;
const TOC_WIDTH = 240;

/**
 * SearchFilters describes the page for the search index: the pages displayed with an explicit version that is also
 * the latest one are not indexed, as they are duplicates of the `latest` pages.
 */
function SearchFilters({ page }: { page: DocsPageData }) {
  const scopes =
    page.resolvedVersion === undefined
      ? [LATEST_SCOPE]
      : page.isLatest
        ? [LATEST_SCOPE, versionScope(page.source.id, page.resolvedVersion)]
        : [versionScope(page.source.id, page.resolvedVersion)];
  return (
    <Box hidden>
      <span data-pagefind-filter="section">{page.source.title}</span>
      <span data-pagefind-filter="source">{page.source.id}</span>
      {scopes.map((scope) => (
        <span key={scope} data-pagefind-filter="scope">
          {scope}
        </span>
      ))}
    </Box>
  );
}

export default function DocsPage({ loaderData }: Route.ComponentProps) {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if ('to' in loaderData) {
    return <Redirect to={loaderData.to} />;
  }

  const page = loaderData;
  const indexed = page.canonical === page.path;
  const trail = findTrail(page.nav, pathname).slice(0, -1);
  const sidebar = (onNavigate?: () => void) => (
    <DocsSidebar
      sources={page.sources}
      source={page.source.id}
      versions={page.versions}
      version={page.resolvedVersion}
      nav={page.nav}
      pathname={pathname}
      onNavigate={onNavigate}
    />
  );

  return (
    <Box sx={{ display: 'flex', width: '100%', maxWidth: 1440, mx: 'auto' }}>
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        {sidebar()}
      </Box>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ display: { md: 'none' } }}>
        <Box sx={{ width: SIDEBAR_WIDTH }}>{sidebar(() => setDrawerOpen(false))}</Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, px: { xs: 2, sm: 4, lg: 6 }, py: 4 }}>
        <Button
          startIcon={<MenuOpen />}
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { md: 'none' }, mb: 2 }}
          variant="outlined"
          size="small"
        >
          {page.source.title} documentation
        </Button>
        {!page.isLatest && page.resolvedVersion !== undefined && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You are reading the documentation of {page.source.title} {page.resolvedVersion}.{' '}
            <Link component={RouterLink} to={page.versions.find((v) => v.latest)?.href ?? docsUrl(page.source.id, LATEST)}>
              Go to the latest version ({page.source.latestRelease}).
            </Link>
          </Alert>
        )}
        {trail.length > 0 && (
          <Breadcrumbs sx={{ mb: 2, fontSize: '0.875rem' }} aria-label="Breadcrumb">
            <Typography color="text.secondary" sx={{ fontSize: 'inherit' }}>
              {page.source.title}
            </Typography>
            {trail.map((node) => (
              <Typography key={node.title} color="text.secondary" sx={{ fontSize: 'inherit' }}>
                {node.title}
              </Typography>
            ))}
          </Breadcrumbs>
        )}
        <SearchFilters page={page} />
        <Box component="article" {...(indexed ? { 'data-pagefind-body': '' } : {})}>
          <Markdown hast={page.content.hast} />
        </Box>
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
          {page.editUrl !== undefined && (
            <Button
              href={page.editUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<EditOutlined />}
              size="small"
              color="inherit"
            >
              Edit this page
            </Button>
          )}
        </Box>
        <PageNavigation nav={page.nav} pathname={pathname} prefix={docsUrl(page.source.id, page.version)} />
      </Box>

      {page.content.toc.length > 0 && (
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: TOC_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            py: 4,
            pr: 2,
          }}
        >
          <TableOfContents items={page.content.toc} />
        </Box>
      )}
    </Box>
  );
}
