import ArrowBack from '@mui/icons-material/ArrowBack';
import Search from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDeferredValue, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { loadConfig } from '../../content/config.server';
import { getDocsIndex } from '../../content/docs.server';
import { loadDownloads } from '../../content/downloads.server';
import { monospaceFontFamily } from '../../theme/theme';
import { formatBytes } from '../../utils/format';
import { refreshPlugins } from '../../utils/githubReleases';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import { docsUrl, LATEST } from '../../utils/urls';
import type { Route } from './+types/DownloadPlugins';

export function loader() {
  const downloads = loadDownloads();
  const pluginDocs = getDocsIndex().sources.get('plugins')?.versions[0];
  return {
    repository: loadConfig().downloads.plugins.repository,
    plugins: downloads?.plugins,
    // Plugins having a documentation page, linked from the table.
    documented: [...(pluginDocs?.pages.keys() ?? [])].filter((slug) => !slug.includes('/') && slug !== ''),
    loadPluginDocs: docsUrl('perses', LATEST, 'configuration/load-plugin'),
  };
}

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: 'Download the plugins',
    description: 'Download the latest releases of the plugins maintained by the Perses team.',
    canonical: '/download/plugins/',
    siteUrl: siteUrlFrom(matches),
  });
}

export default function DownloadPlugins({ loaderData }: Route.ComponentProps) {
  const [filter, setFilter] = useState('');
  // The releases of the build are displayed first, then updated with the plugins released since then, if any.
  const [freshPlugins, setFreshPlugins] = useState<NonNullable<typeof loaderData.plugins>>();

  useEffect(() => {
    let cancelled = false;
    void refreshPlugins(loaderData.repository, loaderData.plugins).then((updated) => {
      if (!cancelled && updated !== undefined) {
        setFreshPlugins(updated);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loaderData.repository, loaderData.plugins]);

  const allPlugins = freshPlugins ?? loaderData.plugins ?? [];
  const documented = new Set(loaderData.documented);
  const deferredFilter = useDeferredValue(filter.trim().toLowerCase());
  const plugins = allPlugins.filter(
    (plugin) => deferredFilter === '' || plugin.name.toLowerCase().includes(deferredFilter) || plugin.id.includes(deferredFilter),
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }} data-pagefind-body="">
      <span hidden data-pagefind-filter="scope">
        latest
      </span>
      <Button component={RouterLink} to="/download/" startIcon={<ArrowBack />} sx={{ mb: 2, px: 0 }}>
        Download Perses
      </Button>
      <Typography variant="h1" gutterBottom>
        Plugins
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        Perses is extended with plugins (datasources, panels, variables, explorers). The official plugins are embedded
        in the Perses distribution; download them to upgrade a plugin independently or to load them in your own
        instance. Read <Link component={RouterLink} to={loaderData.loadPluginDocs}>how to load a plugin</Link>.
      </Typography>
      {allPlugins.length === 0 ? (
        <Alert severity="info">
          The list of plugins is not available. Download them from{' '}
          <Link href={`https://github.com/${loaderData.repository}/releases`} target="_blank" rel="noopener noreferrer">
            GitHub
          </Link>
          .
        </Alert>
      ) : (
        <>
          <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Filter the plugins"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
                htmlInput: { 'aria-label': 'Filter the plugins' },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {plugins.length} plugin{plugins.length > 1 ? 's' : ''}
            </Typography>
          </Stack>
          <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Plugin</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Released</TableCell>
                  <TableCell>Archive</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell>SHA256 checksum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plugins.map((plugin) => (
                  <TableRow key={plugin.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {!documented.has(plugin.id) ? (
                        plugin.name
                      ) : (
                        <Link component={RouterLink} to={docsUrl('plugins', undefined, plugin.id)}>
                          {plugin.name}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={plugin.url} target="_blank" rel="noopener noreferrer">
                        v{plugin.version}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{plugin.date}</TableCell>
                    <TableCell>
                      {plugin.asset !== undefined && (
                        <Link href={plugin.asset.url} sx={{ fontFamily: monospaceFontFamily, fontSize: '0.8125rem' }}>
                          {plugin.asset.name}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {plugin.asset !== undefined && formatBytes(plugin.asset.size)}
                    </TableCell>
                    <TableCell>
                      {plugin.asset?.sha256 !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            component="code"
                            title={plugin.asset.sha256}
                            sx={{ fontFamily: monospaceFontFamily, fontSize: '0.75rem', color: 'text.secondary' }}
                          >
                            {plugin.asset.sha256.slice(0, 16)}…
                          </Box>
                          <CopyButton value={plugin.asset.sha256} label="Copy the checksum" />
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
}
