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

import ArrowForward from '@mui/icons-material/ArrowForward';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { CopyButton } from '../../components/CopyButton/CopyButton';
import { loadConfig } from '../../content/config.server';
import { loadDownloads } from '../../content/downloads.server';
import { monospaceFontFamily } from '../../theme/theme';
import { formatBytes, osLabel } from '../../utils/format';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import { refreshBinaries } from '../../utils/githubReleases';
import { detectCurrentPlatform, type Platform } from '../../utils/platform';
import { type BinaryRelease, renderInstallCommand } from '../../utils/releases';
import type { Route } from './+types/Download';

export function loader() {
  const downloads = loadDownloads();
  return {
    binaries: downloads?.binaries,
    configs: loadConfig().downloads.binaries,
  };
}

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: 'Download',
    description: 'Download the latest releases of Perses, the Perses operator and metrics-usage.',
    canonical: '/download/',
    siteUrl: siteUrlFrom(matches),
  });
}

const ALL = 'all';

function Command({ label, command }: { label: string; command: string }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          p: 1.5,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Box
          component="pre"
          sx={{ m: 0, flexGrow: 1, overflowX: 'auto', fontFamily: monospaceFontFamily, fontSize: '0.8125rem' }}
        >
          {command}
        </Box>
        <CopyButton value={command} label={`Copy the ${label} command`} />
      </Box>
    </Box>
  );
}

function BinarySection({ binary, os, arch }: { binary: BinaryRelease; os: string; arch: string }) {
  const archives = binary.assets.filter(
    (asset) => asset.kind === 'archive' && (os === ALL || asset.os === os) && (arch === ALL || asset.arch === arch),
  );
  const checksums = binary.assets.find((asset) => asset.kind === 'checksums');
  return (
    <Box component="section" id={binary.id} sx={{ scrollMarginTop: 88 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
        <Typography variant="h2">{binary.title}</Typography>
        <Chip label={binary.version} color="primary" size="small" />
        <Typography variant="body2" color="text.secondary">
          Released on {binary.date}
        </Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {binary.description}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Link href={binary.url} target="_blank" rel="noopener noreferrer">
          Release notes
        </Link>
        <Link href={`https://github.com/${binary.repository}/releases`} target="_blank" rel="noopener noreferrer">
          All releases
        </Link>
        {checksums !== undefined && <Link href={checksums.url}>Checksums</Link>}
      </Stack>
      <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Arch</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell>SHA256 checksum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {archives.map((asset) => (
              <TableRow key={asset.name} hover>
                <TableCell>
                  <Link href={asset.url} sx={{ fontFamily: monospaceFontFamily, fontSize: '0.8125rem' }}>
                    {asset.name}
                  </Link>
                </TableCell>
                <TableCell>{asset.os === undefined ? '' : osLabel(asset.os)}</TableCell>
                <TableCell>{asset.arch}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {formatBytes(asset.size)}
                </TableCell>
                <TableCell>
                  {asset.sha256 !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box
                        component="code"
                        title={asset.sha256}
                        sx={{ fontFamily: monospaceFontFamily, fontSize: '0.75rem', color: 'text.secondary' }}
                      >
                        {asset.sha256.slice(0, 16)}…
                      </Box>
                      <CopyButton value={asset.sha256} label="Copy the checksum" />
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {archives.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No binary for this platform.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {binary.install.length > 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
          {binary.install.map((step) => (
            <Command key={step.label} label={step.label} command={renderInstallCommand(step.command, binary.version)} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function Download({ loaderData }: Route.ComponentProps) {
  const [os, setOs] = useState(ALL);
  const [arch, setArch] = useState(ALL);
  const [detected, setDetected] = useState<Platform>();
  // The releases of the build are displayed first, then replaced by the newer ones published on GitHub, if any.
  const [freshBinaries, setFreshBinaries] = useState<BinaryRelease[]>();
  const binaries = freshBinaries ?? loaderData.binaries ?? [];
  const archives = binaries.flatMap((binary) => binary.assets.filter((asset) => asset.kind === 'archive'));
  const oses = [...new Set(archives.map((asset) => asset.os).filter((value) => value !== undefined))];
  const arches = [...new Set(archives.map((asset) => asset.arch).filter((value) => value !== undefined))];

  // The platform is detected in the browser only, so the prerendered page lists every archive.
  useEffect(() => {
    let cancelled = false;
    const assets = (loaderData.binaries ?? []).flatMap((binary) => binary.assets);
    void detectCurrentPlatform().then((platform) => {
      if (cancelled) {
        return;
      }
      const result: Platform = {
        os: assets.some((asset) => asset.os === platform.os) ? platform.os : undefined,
        arch: assets.some((asset) => asset.arch === platform.arch) ? platform.arch : undefined,
      };
      // Don't override a filter the visitor already changed.
      if (result.os !== undefined) {
        setOs((current) => (current === ALL ? (result.os ?? ALL) : current));
      }
      if (result.arch !== undefined) {
        setArch((current) => (current === ALL ? (result.arch ?? ALL) : current));
      }
      setDetected(result);
    });
    return () => {
      cancelled = true;
    };
  }, [loaderData.binaries]);

  useEffect(() => {
    let cancelled = false;
    void refreshBinaries(loaderData.configs, loaderData.binaries).then((updated) => {
      if (!cancelled && updated !== undefined) {
        setFreshBinaries(updated);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loaderData.configs, loaderData.binaries]);

  const presetFromPlatform =
    detected !== undefined &&
    (detected.os !== undefined || detected.arch !== undefined) &&
    os === (detected.os ?? ALL) &&
    arch === (detected.arch ?? ALL);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }} data-pagefind-body="">
      <span hidden data-pagefind-filter="scope">
        latest
      </span>
      <Typography variant="h1" gutterBottom>
        Download
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
        The binaries below are the latest releases. The archives are built for every supported platform, verify them
        with the SHA256 checksums. For older versions, check the releases on GitHub.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6, alignItems: { sm: 'center' } }}>
        <TextField select size="small" label="Operating system" value={os} onChange={(e) => setOs(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value={ALL}>All</MenuItem>
          {oses.map((value) => (
            <MenuItem key={value} value={value}>
              {osLabel(value)}
            </MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Architecture" value={arch} onChange={(e) => setArch(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value={ALL}>All</MenuItem>
          {arches.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        {presetFromPlatform && (
          <Typography variant="body2" color="text.secondary">
            Filtered for your platform.{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setOs(ALL);
                setArch(ALL);
              }}
              sx={{ verticalAlign: 'baseline' }}
            >
              Show all
            </Link>
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button component={RouterLink} to="/download/plugins/" endIcon={<ArrowForward />} variant="outlined">
          Download the plugins
        </Button>
      </Stack>
      {binaries.length === 0 ? (
        <Alert severity="info">
          The list of releases is not available. Download the binaries from GitHub:{' '}
          {loaderData.configs.map((binary, index) => (
            <span key={binary.id}>
              {index > 0 && ', '}
              <Link href={`https://github.com/${binary.repository}/releases/latest`} target="_blank" rel="noopener noreferrer">
                {binary.title} <OpenInNew sx={{ fontSize: '0.8rem' }} />
              </Link>
            </span>
          ))}
          .
        </Alert>
      ) : (
        <Stack spacing={8}>
          {binaries.map((binary) => (
            <BinarySection key={binary.id} binary={binary} os={os} arch={arch} />
          ))}
        </Stack>
      )}
    </Container>
  );
}
