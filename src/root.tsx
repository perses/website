import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './theme/global.css';
import { CacheProvider } from '@emotion/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { Route } from './+types/root';
import { createEmotionCache } from './theme/createEmotionCache';
import { theme } from './theme/theme';

export const links: Route.LinksFunction = () => [
  { rel: 'icon', type: 'image/png', href: '/assets/images/favicon.png' },
  { rel: 'alternate', type: 'application/rss+xml', title: 'Perses Blog', href: '/blog/rss.xml' },
  { rel: 'alternate', type: 'application/feed+json', title: 'Perses Blog', href: '/blog/feed.json' },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <InitColorSchemeScript attribute="class" />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// On the server, the cache is provided by entry.server.tsx so the styles can be extracted.
const clientCache = typeof window === 'undefined' ? undefined : createEmotionCache();

function Providers({ children }: { children: ReactNode }) {
  const content = (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
  return clientCache === undefined ? content : <CacheProvider value={clientCache}>{content}</CacheProvider>;
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const details = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;
  return (
    <Providers>
      <Box component="main" sx={{ py: 12, px: 2, maxWidth: 'md', mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom>
          {notFound ? 'Page not found' : 'Something went wrong'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {notFound ? 'The page you are looking for does not exist or has been moved.' : 'An unexpected error occurred.'}
        </Typography>
        <Button variant="contained" href="/">
          Back to the home page
        </Button>
        {details !== undefined && (
          <Box component="pre" sx={{ mt: 4, p: 2, textAlign: 'left', overflowX: 'auto' }}>
            {details}
          </Box>
        )}
      </Box>
    </Providers>
  );
}
