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

import Check from '@mui/icons-material/Check';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { type ComponentProps, useRef, useState } from 'react';
import { monospaceFontFamily } from '../../theme/theme';

/**
 * CodeBlock renders a code block highlighted at build time, with a button to copy its content.
 */
export function CodeBlock({ children, className, style, ...props }: ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.querySelector('code')?.textContent ?? ref.current?.textContent ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Box sx={{ position: 'relative', my: 2, '&:hover .copy-button, & .copy-button:focus-visible': { opacity: 1 } }}>
      <Box
        component="pre"
        ref={ref}
        className={className}
        style={style}
        {...props}
        sx={{
          m: 0,
          p: 2,
          pr: 6,
          overflowX: 'auto',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          fontFamily: monospaceFontFamily,
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          '& code': { fontFamily: 'inherit', fontSize: 'inherit', background: 'none', p: 0, border: 0 },
        }}
      >
        {children}
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton
          className="copy-button"
          size="small"
          aria-label="Copy the code"
          onClick={() => void copy()}
          sx={{ position: 'absolute', top: 6, right: 6, opacity: 0, transition: 'opacity 0.2s', bgcolor: 'background.paper' }}
        >
          {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
