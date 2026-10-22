import Box from '@mui/material/Box';
import { Outlet } from 'react-router';
import { AppHeader } from '../../components/AppHeader/AppHeader';
import { Footer } from '../../components/Footer/Footer';
import { loadSiteData } from '../../content/site.server';
import type { Route } from './+types/Layout';

export function loader() {
  return loadSiteData();
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader menu={loaderData.menu} repositoryUrl={loaderData.repositoryUrl} />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      <Footer trademark={loaderData.footer.trademark} links={loaderData.footer.links} />
    </Box>
  );
}
