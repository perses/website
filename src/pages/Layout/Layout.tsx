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
