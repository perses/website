import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router';
import type { NavNode } from '../../content/types';
import { siblings } from '../../utils/nav';

export interface PageNavigationProps {
  nav: NavNode[];
  pathname: string;
  prefix: string;
}

/**
 * PageNavigation links to the previous and the next pages of the documentation.
 */
export function PageNavigation({ nav, pathname, prefix }: PageNavigationProps) {
  const { previous, next } = siblings(nav, pathname, prefix);
  if (previous === undefined && next === undefined) {
    return null;
  }
  return (
    <Box
      component="nav"
      aria-label="Previous and next pages"
      sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2, pt: 3, borderTop: 1, borderColor: 'divider' }}
    >
      {previous?.href !== undefined ? (
        <Button component={RouterLink} to={previous.href} startIcon={<ArrowBack />} sx={{ textAlign: 'left' }}>
          {previous.title}
        </Button>
      ) : (
        <span />
      )}
      {next?.href !== undefined && (
        <Button component={RouterLink} to={next.href} endIcon={<ArrowForward />} sx={{ textAlign: 'right' }}>
          {next.title}
        </Button>
      )}
    </Box>
  );
}
