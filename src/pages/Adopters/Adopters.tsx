import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { AdopterLogos } from '../../components/AdopterLogos/AdopterLogos';
import { Markdown } from '../../components/Markdown/Markdown';
import { loadAdopters } from '../../content/adopters.server';
import { loadPage } from '../../content/pages.server';
import { pageMeta, siteUrlFrom } from '../../utils/meta';
import type { Route } from './+types/Adopters';

export async function loader() {
  return { adopters: loadAdopters(), page: await loadPage('adopters') };
}

export function meta({ matches }: Route.MetaArgs) {
  return pageMeta({
    title: 'Adopters',
    description: 'Companies using and contributing to Perses.',
    canonical: '/adopters/',
    siteUrl: siteUrlFrom(matches),
  });
}

export default function Adopters({ loaderData }: Route.ComponentProps) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }} data-pagefind-body="">
      <span hidden data-pagefind-filter="scope">
        latest
      </span>
      <Markdown hast={loaderData.page.hast} />
      <Typography variant="h2" sx={{ mt: 6, mb: 3 }}>
        They use Perses
      </Typography>
      <AdopterLogos adopters={loaderData.adopters} />
    </Container>
  );
}
