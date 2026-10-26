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
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router';
import { parseInlineLinks } from '../../utils/inlineLinks';
import { isExternalHref } from '../../utils/urls';
import { monospaceFontFamily } from '../../theme/theme';

function Code({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, index) =>
        index % 2 === 1 ? (
          <Box
            component="code"
            key={index}
            sx={{ fontFamily: monospaceFontFamily, fontSize: '0.9em', px: 0.5, borderRadius: 0.5, bgcolor: 'action.hover' }}
          >
            {part}
          </Box>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * InlineText renders a short text supporting the inline code (`code`) and the links ([label](href)) of markdown.
 */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInlineLinks(text).map((token, index) => {
        if (token.type === 'text') {
          return <Code key={index} text={token.value} />;
        }
        return isExternalHref(token.href) ? (
          <Link key={index} href={token.href} target="_blank" rel="noopener noreferrer">
            {token.label}
          </Link>
        ) : (
          <Link key={index} component={RouterLink} to={token.href}>
            {token.label}
          </Link>
        );
      })}
    </>
  );
}
