import ExpandMore from '@mui/icons-material/ExpandMore';
import Alert, { type AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export interface AdmonitionProps {
  severity: AlertColor;
  title: string;
  collapsible?: 'open' | 'closed';
  children: ReactNode;
}

/**
 * Admonition renders the callouts of the documentation (`!!! note` with mkdocs syntax or `> [!NOTE]` with the GitHub
 * one). Collapsible admonitions use a native details element so they work without JavaScript.
 */
export function Admonition({ severity, title, collapsible, children }: AdmonitionProps) {
  const body = <Box sx={{ '& > :first-of-type': { mt: 0 }, '& > :last-child': { mb: 0 } }}>{children}</Box>;
  return (
    <Alert severity={severity} variant="outlined" sx={{ my: 2, '& .MuiAlert-message': { width: '100%', overflow: 'auto' } }}>
      {collapsible === undefined ? (
        <>
          <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>
          {body}
        </>
      ) : (
        <Box
          component="details"
          open={collapsible === 'open'}
          sx={{ '&[open] > summary svg': { transform: 'rotate(180deg)' } }}
        >
          <Box
            component="summary"
            sx={{ cursor: 'pointer', fontWeight: 600, listStyle: 'none', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {title}
            <ExpandMore fontSize="small" />
          </Box>
          <Box sx={{ mt: 1 }}>{body}</Box>
        </Box>
      )}
    </Alert>
  );
}
