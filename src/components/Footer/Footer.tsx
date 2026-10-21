import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { parseInlineLinks } from '../../utils/inlineLinks';
import { isExternalHref } from '../../utils/urls';
import { SocialIcon, type SocialIconName } from '../SocialIcon/SocialIcon';

export interface FooterLink {
  name: string;
  icon: SocialIconName;
  href: string;
}

export interface FooterProps {
  trademark: string;
  links: FooterLink[];
}

export function Footer({ trademark, links }: FooterProps) {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 2 }}
        >
          <Link component={RouterLink} to="/adopters/" color="text.secondary">
            Adopters
          </Link>
          <Stack direction="row" spacing={0.5}>
            {links.map((link) => (
              <Tooltip key={link.href} title={link.name}>
                <IconButton
                  component="a"
                  href={link.href}
                  aria-label={link.name}
                  size="small"
                  {...(isExternalHref(link.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <SocialIcon name={link.icon} fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {parseInlineLinks(trademark).map((token, index) =>
            token.type === 'text' ? (
              token.value
            ) : (
              <Link key={index} href={token.href} target="_blank" rel="noopener noreferrer">
                {token.label}
              </Link>
            ),
          )}
        </Typography>
      </Container>
    </Box>
  );
}
