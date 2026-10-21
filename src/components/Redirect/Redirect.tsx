import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

/**
 * redirectMeta returns the meta tags of a static redirection page: the browser follows the refresh meta tag even
 * without JavaScript, and search engines use the canonical link.
 */
export function redirectMeta(to: string) {
  return [
    { title: 'Redirecting…' },
    { httpEquiv: 'refresh', content: `0; url=${to}` },
    { name: 'robots', content: 'noindex' },
    { tagName: 'link', rel: 'canonical', href: to },
  ];
}

/**
 * Redirect is the content of the static pages redirecting to another URL, for example the URLs of the previous
 * website. With JavaScript, the client-side navigation is used.
 */
export function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate(to, { replace: true });
  }, [navigate, to]);
  return (
    <Box sx={{ py: 12, textAlign: 'center' }}>
      <Typography>
        This page has moved to{' '}
        <Link component={RouterLink} to={to}>
          {to}
        </Link>
        .
      </Typography>
    </Box>
  );
}
