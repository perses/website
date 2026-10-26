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
import CloudOutlined from '@mui/icons-material/CloudOutlined';
import ExtensionOutlined from '@mui/icons-material/ExtensionOutlined';
import GitHub from '@mui/icons-material/GitHub';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import TerminalOutlined from '@mui/icons-material/TerminalOutlined';
import WidgetsOutlined from '@mui/icons-material/WidgetsOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { AdopterLogos } from '../../components/AdopterLogos/AdopterLogos';
import { FeatureSection } from '../../components/FeatureSection/FeatureSection';
import { InlineText } from '../../components/InlineText/InlineText';
import { ThemedImage } from '../../components/ThemedImage/ThemedImage';
import { loadAdopters } from '../../content/adopters.server';
import { loadPosts } from '../../content/blog.server';
import { blue } from '../../theme/colors';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import type { Route } from './+types/Home';
import { featureGroups, type Highlight, highlights } from './content';

export async function loader() {
  const [latestPost] = await loadPosts();
  return {
    adopters: loadAdopters(),
    latestPost: latestPost === undefined ? undefined : { title: latestPost.title, url: latestPost.url },
  };
}

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    description: 'An open specification for dashboards. The open dashboard tool for Prometheus and other data sources.',
    canonical: '/',
    siteUrl: siteUrlFrom(matches),
  });
}

const highlightIcons: Record<Highlight['icon'], typeof InsightsOutlined> = {
  observability: InsightsOutlined,
  embeddable: WidgetsOutlined,
  devops: TerminalOutlined,
  scale: LayersOutlined,
  kubernetes: CloudOutlined,
  extensible: ExtensionOutlined,
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography variant="h2" sx={{ textAlign: 'center', fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: { xs: 4, md: 6 } }}>
      {children}
    </Typography>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <Box
        component="section"
        sx={(theme) => ({
          pt: { xs: 6, md: 10 },
          pb: { xs: 4, md: 6 },
          background: `radial-gradient(ellipse at top, ${blue[100]} 0%, transparent 60%)`,
          ...theme.applyStyles('dark', {
            background: `radial-gradient(ellipse at top, ${blue[850]} 0%, transparent 60%)`,
          }),
        })}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          {loaderData.latestPost !== undefined && (
            <Chip
              component={RouterLink}
              to={loaderData.latestPost.url}
              clickable
              label={`New: ${loaderData.latestPost.title} →`}
              color="primary"
              variant="outlined"
              sx={{ mb: 4, bgcolor: 'background.paper' }}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ThemedImage
              light="/assets/images/logos/Perses_light_theme.png"
              dark="/assets/images/logos/Perses_dark_theme.png"
              alt="Perses logo"
              sx={{ height: { xs: 56, md: 80 }, width: 'auto' }}
            />
          </Box>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: '1.75rem', md: '2.75rem' }, maxWidth: 900, mx: 'auto', mb: 4, letterSpacing: '-0.02em' }}
          >
            An open specification for dashboards. The open dashboard tool for Prometheus and other data sources.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/docs/perses/latest/getting-started/"
              endIcon={<ArrowForward />}
            >
              Get started
            </Button>
            <Button variant="outlined" size="large" href="https://demo.perses.dev" target="_blank" rel="noopener noreferrer">
              Try the demo
            </Button>
            <Button
              variant="text"
              size="large"
              color="inherit"
              href="https://github.com/perses/perses"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHub />}
            >
              GitHub
            </Button>
          </Stack>
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 24px 60px rgba(20, 115, 230, 0.18)',
              maxWidth: 1100,
              mx: 'auto',
            }}
          >
            <Box
              component="img"
              src="/assets/images/home/perses_overview.gif"
              alt="Perses overview"
              sx={{ display: 'block', width: '100%' }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
          {highlights.map((highlight) => {
            const Icon = highlightIcons[highlight.icon];
            return (
              <Card key={highlight.title} variant="outlined" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      mb: 2,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {highlight.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.7 }}>
                    <InlineText text={highlight.description} />
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        <Typography sx={{ textAlign: 'center', mt: 4, fontWeight: 600 }} color="text.secondary">
          ...and more to discover!
        </Typography>
      </Container>

      {featureGroups.map((group, groupIndex) => (
        <Box
          component="section"
          key={group.title}
          sx={{ py: { xs: 6, md: 10 }, bgcolor: groupIndex % 2 === 0 ? 'action.hover' : 'transparent' }}
        >
          <Container maxWidth="lg">
            <SectionTitle>{group.title}</SectionTitle>
            <Stack spacing={{ xs: 6, md: 10 }}>
              {group.features.map((feature, index) => (
                <FeatureSection key={feature.title} feature={feature} reverse={index % 2 === 1} />
              ))}
            </Stack>
            {group.outro !== undefined && (
              <Typography sx={{ textAlign: 'center', mt: 6 }} color="text.secondary">
                <InlineText text={group.outro} />
              </Typography>
            )}
          </Container>
        </Box>
      ))}

      <Container maxWidth="md" component="section" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <SectionTitle>Open Source</SectionTitle>
        <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Perses is 100% open source and community-driven. All components are available under the{' '}
          <Link href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">
            Apache 2.0 License
          </Link>{' '}
          on{' '}
          <Link href="https://github.com/perses" target="_blank" rel="noopener noreferrer">
            GitHub
          </Link>
          .
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Perses is a{' '}
          <Link href="https://cncf.io" target="_blank" rel="noopener noreferrer">
            Cloud Native Computing Foundation
          </Link>{' '}
          sandbox project.
        </Typography>
        <Box component="a" href="https://cncf.io" target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-block' }}>
          <ThemedImage
            light="/assets/images/logos/CNCF_light_theme.png"
            dark="/assets/images/logos/CNCF_dark_theme.png"
            alt="CNCF logo"
            loading="lazy"
            sx={{ height: 48, width: 'auto' }}
          />
        </Box>
      </Container>

      <Box component="section" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'action.hover' }}>
        <Container maxWidth="lg">
          <SectionTitle>Adopters</SectionTitle>
          <AdopterLogos adopters={loaderData.adopters} />
          <Typography sx={{ textAlign: 'center', mt: 4 }}>
            Want your company logo here?{' '}
            <Link component={RouterLink} to="/adopters/">
              → Learn more
            </Link>
          </Typography>
        </Container>
      </Box>
    </>
  );
}
