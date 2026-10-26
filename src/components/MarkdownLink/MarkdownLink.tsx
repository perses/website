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

import Link from '@mui/material/Link';
import type { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router';
import { isExternalHref } from '../../utils/urls';

/**
 * MarkdownLink renders the links of a markdown document: internal links use the client-side navigation, external
 * links open in a new tab.
 */
export function MarkdownLink({ href = '', children, className, id, title }: ComponentProps<'a'>) {
  if (href.startsWith('#') || href === '') {
    return (
      <Link href={href} className={className} id={id} title={title}>
        {children}
      </Link>
    );
  }
  if (isExternalHref(href) || /^\/(docs-assets|assets)\//.test(href)) {
    return (
      <Link href={href} className={className} id={id} title={title} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    );
  }
  return (
    <Link component={RouterLink} to={href} className={className} id={id} title={title}>
      {children}
    </Link>
  );
}
