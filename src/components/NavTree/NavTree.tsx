import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import type { NavNode } from '../../content/types';
import { containsActive, isActive } from '../../utils/nav';

export interface NavTreeProps {
  nodes: NavNode[];
  pathname: string;
  onNavigate?: () => void;
}

interface NavItemProps {
  node: NavNode;
  depth: number;
  pathname: string;
  id: string;
  open: Map<string, boolean>;
  toggle: (id: string, value: boolean) => void;
  onNavigate?: () => void;
}

function NavItem({ node, depth, pathname, id, open, toggle, onNavigate }: NavItemProps) {
  const padding = 1.5 + depth * 1.5;
  if (node.children !== undefined) {
    const expanded = open.get(id) ?? containsActive(node, pathname);
    return (
      <>
        <ListItemButton
          onClick={() => toggle(id, !expanded)}
          aria-expanded={expanded}
          sx={{ pl: padding, py: 0.5, borderRadius: 1 }}
        >
          <ListItemText
            primary={node.title}
            slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: depth === 0 ? 600 : 500 } } }}
          />
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </ListItemButton>
        <Collapse in={expanded} timeout="auto">
          <List disablePadding dense>
            {node.children.map((child, index) => (
              <NavItem
                key={`${child.title}-${index}`}
                node={child}
                depth={depth + 1}
                pathname={pathname}
                id={`${id}/${index}`}
                open={open}
                toggle={toggle}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      </>
    );
  }
  const active = isActive(node, pathname);
  const linkProps = node.external
    ? { component: 'a' as const, href: node.href, target: '_blank', rel: 'noopener noreferrer' }
    : { component: RouterLink, to: node.href ?? '/' };
  return (
    <ListItemButton
      {...linkProps}
      selected={active}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      sx={{ pl: padding, py: 0.5, borderRadius: 1 }}
    >
      <ListItemText
        primary={node.title}
        slotProps={{
          primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : depth === 0 ? 500 : 400 } },
        }}
      />
      {node.external && <OpenInNew sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />}
    </ListItemButton>
  );
}

function NavTreeContent({ nodes, pathname, onNavigate }: NavTreeProps) {
  // Sections expanded or collapsed by the visitor. By default, only the sections containing the current page are
  // expanded.
  const [open, setOpen] = useState<Map<string, boolean>>(() => new Map());
  const toggle = (id: string, value: boolean) => setOpen((previous) => new Map(previous).set(id, value));
  return (
    <List component="div" disablePadding dense>
      {nodes.map((node, index) => (
        <NavItem
          key={`${node.title}-${index}`}
          node={node}
          depth={0}
          pathname={pathname}
          id={String(index)}
          open={open}
          toggle={toggle}
          onNavigate={onNavigate}
        />
      ))}
    </List>
  );
}

/**
 * NavTree displays the navigation of a documentation source. The sections containing the current page are expanded.
 * The sections expanded or collapsed by the visitor are reset when the page changes, so the current page is always
 * visible, like on a website where each page is loaded from the server.
 */
export function NavTree(props: NavTreeProps) {
  return <NavTreeContent key={props.pathname} {...props} />;
}
