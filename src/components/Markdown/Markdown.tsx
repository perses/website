import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { Root } from 'hast';
import { type Components, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { type ComponentProps, createElement, type ReactNode, useMemo } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { monospaceFontFamily } from '../../theme/theme';
import { Admonition, type AdmonitionProps } from '../Admonition/Admonition';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { MarkdownImage } from '../MarkdownImage/MarkdownImage';
import { MarkdownLink } from '../MarkdownLink/MarkdownLink';
import { Mermaid } from '../Mermaid/Mermaid';

type DataProps = Record<`data-${string}`, string | undefined>;

function textContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textContent).join('');
  }
  return '';
}

function Pre(props: ComponentProps<'pre'>) {
  if (typeof props.className === 'string' && props.className.split(' ').includes('mermaid')) {
    return <Mermaid chart={textContent(props.children)} />;
  }
  return <CodeBlock {...props} />;
}

function Aside(props: ComponentProps<'aside'> & DataProps) {
  const severity = props['data-severity'] as AdmonitionProps['severity'] | undefined;
  if (severity === undefined) {
    return <aside {...props} />;
  }
  return (
    <Admonition
      severity={severity}
      title={props['data-title'] ?? ''}
      collapsible={props['data-collapsible'] as AdmonitionProps['collapsible']}
    >
      {props.children}
    </Admonition>
  );
}

function Table(props: ComponentProps<'table'>) {
  return (
    <Box sx={{ overflowX: 'auto', my: 2 }}>
      <table {...props} />
    </Box>
  );
}

function heading(tag: 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return function Heading({ id, children, ...props }: ComponentProps<'h2'>) {
    return createElement(
      tag,
      { id, ...props },
      children,
      id === undefined ? null : (
        <a className="anchor" href={`#${id}`} aria-label="Link to this section" data-pagefind-ignore="">
          #
        </a>
      ),
    );
  };
}

const components: Partial<Components> = {
  a: MarkdownLink,
  img: MarkdownImage,
  pre: Pre,
  aside: Aside,
  table: Table,
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),
};

export const markdownStyles: SxProps<Theme> = (theme) => ({
  fontSize: '1rem',
  lineHeight: 1.7,
  wordBreak: 'break-word',
  '& h1': { ...theme.typography.h1, mt: 0, mb: 3 },
  '& h2': { ...theme.typography.h2, mt: 5, mb: 2 },
  '& h3': { ...theme.typography.h3, mt: 4, mb: 1.5 },
  '& h4': { ...theme.typography.h4, mt: 3, mb: 1 },
  '& h5, & h6': { ...theme.typography.h5, mt: 3, mb: 1 },
  '& :is(h1, h2, h3, h4, h5, h6) .anchor': {
    ml: 1,
    color: 'text.secondary',
    textDecoration: 'none',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  '& :is(h1, h2, h3, h4, h5, h6):hover .anchor, & .anchor:focus-visible': { opacity: 1 },
  '& p, & ul, & ol': { my: 1.5 },
  '& li > p': { my: 0.5 },
  '& li + li': { mt: 0.5 },
  '& :not(pre) > code': {
    fontFamily: monospaceFontFamily,
    fontSize: '0.85em',
    px: 0.5,
    py: 0.25,
    borderRadius: 0.5,
    bgcolor: 'action.hover',
  },
  '& blockquote': {
    mx: 0,
    my: 2,
    pl: 2,
    borderLeft: 4,
    borderColor: 'divider',
    color: 'text.secondary',
  },
  '& hr': { border: 0, borderTop: 1, borderColor: 'divider', my: 4 },
  '& table': { borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' },
  '& th, & td': { border: 1, borderColor: 'divider', px: 1.5, py: 1, textAlign: 'left', verticalAlign: 'top' },
  '& th': { bgcolor: 'action.hover', fontWeight: 600 },
  '& video': { maxWidth: '100%', borderRadius: 1, my: 2 },
  '& kbd': {
    fontFamily: monospaceFontFamily,
    fontSize: '0.8em',
    border: 1,
    borderColor: 'divider',
    borderRadius: 0.5,
    px: 0.5,
  },
});

export interface MarkdownProps {
  hast: Root;
}

/**
 * Markdown renders a markdown document converted to a HTML syntax tree at build time, using React components for
 * the elements needing interactivity (links, code blocks, images, admonitions, diagrams).
 */
export function Markdown({ hast }: MarkdownProps) {
  const content = useMemo(
    () => toJsxRuntime(hast, { Fragment, jsx, jsxs, components, ignoreInvalidStyle: true, passKeys: true }),
    [hast],
  );
  return (
    <Box className="markdown" sx={markdownStyles}>
      {content}
    </Box>
  );
}
