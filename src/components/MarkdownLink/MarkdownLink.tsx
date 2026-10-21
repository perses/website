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
