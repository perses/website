import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { listSourceSummaries } from '../../content/docs.server';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import { LATEST_SCOPE } from '../../utils/search';
import type { Route } from './+types/DocsIndex';

export function loader() {
  return { sources: listSourceSummaries() };
}

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: 'Documentation',
    description: 'Documentation of Perses, the Perses operator, the Helm charts and the plugins.',
    canonical: '/docs/',
    siteUrl: siteUrlFrom(matches),
  });
}

export default function DocsIndex({ loaderData }: Route.ComponentProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }} data-pagefind-body="">
      <Box hidden>
        <span data-pagefind-filter="section">Documentation</span>
        <span data-pagefind-filter="scope">{LATEST_SCOPE}</span>
      </Box>
      <Typography variant="h1" gutterBottom>
        Documentation
      </Typography>
      <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 6, fontWeight: 400, maxWidth: 720 }}>
        Learn how to install, configure and use Perses, manage it in Kubernetes and extend it with plugins.
      </Typography>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        {loaderData.sources.map((source) => (
          <Card key={source.id} variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main' } }}>
            <CardActionArea component={RouterLink} to={source.href} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h3" component="h2">
                    {source.title}
                  </Typography>
                  {source.latestRelease !== undefined && <Chip size="small" label={source.latestRelease} />}
                </Box>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {source.description}
                </Typography>
                <Typography color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                  Read the documentation <ArrowForward fontSize="small" />
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
