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
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
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
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center', textAlign: { xs: 'center', md: 'left' } }}
        >
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
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
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
      </Container>
    </Box>
  );
}
