import CloseIcon from '@mui/icons-material/Close';
import GitHub from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';
import OpenInNew from '@mui/icons-material/OpenInNew';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';
import { isExternalHref } from '../../utils/urls';
import { SearchDialog } from '../SearchDialog/SearchDialog';
import { ThemedImage } from '../ThemedImage/ThemedImage';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

export interface MenuItem {
  title: string;
  href: string;
}

export interface AppHeaderProps {
  menu: MenuItem[];
  repositoryUrl: string;
}

/**
 * activeMenuHref returns the href of the menu entry matching the current page. When several entries match
 * (`/docs/` and `/docs/plugins/`), the most specific one wins.
 */
export function activeMenuHref(menu: MenuItem[], pathname: string): string | undefined {
  return menu
    .filter((item) => !isExternalHref(item.href) && item.href !== '/' && pathname.startsWith(item.href))
    .toSorted((a, b) => b.href.length - a.href.length)[0]?.href;
}

function linkProps(href: string) {
  return isExternalHref(href)
    ? { component: 'a' as const, href, target: '_blank', rel: 'noopener noreferrer' }
    : { component: RouterLink, to: href };
}

export function AppHeader({ menu, repositoryUrl }: AppHeaderProps) {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = activeMenuHref(menu, pathname);

  return (
    <AppBar
      position="sticky"
      sx={(theme) => ({
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.85)`
          : alpha(theme.palette.background.default, 0.85),
        backdropFilter: 'blur(8px)',
      })}
    >
      <Toolbar sx={{ gap: 1, maxWidth: 1440, width: '100%', mx: 'auto' }}>
        <Box component={RouterLink} to="/" aria-label="Perses home page" sx={{ display: 'flex', mr: 2 }}>
          <ThemedImage
            light="/assets/images/logos/Perses_light_theme.png"
            dark="/assets/images/logos/Perses_dark_theme.png"
            alt="Perses"
            sx={{ height: 32, width: 'auto' }}
          />
        </Box>
        <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          {menu.map((item) => (
            <Button
              key={item.href}
              {...linkProps(item.href)}
              color={item.href === active ? 'primary' : 'inherit'}
              aria-current={item.href === active ? 'page' : undefined}
              endIcon={isExternalHref(item.href) ? <OpenInNew sx={{ fontSize: '0.9rem !important' }} /> : undefined}
              sx={{ fontWeight: item.href === active ? 700 : 500 }}
            >
              {item.title}
            </Button>
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <SearchDialog />
        <ThemeToggle />
        <Tooltip title="GitHub repository">
          <IconButton
            color="inherit"
            component="a"
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <GitHub />
          </IconButton>
        </Tooltip>
        <IconButton
          color="inherit"
          aria-label="Open the menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton aria-label="Close the menu" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List component="nav" aria-label="Main">
            {menu.map((item) => (
              <ListItemButton
                key={item.href}
                {...linkProps(item.href)}
                selected={item.href === active}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={item.title} />
                {isExternalHref(item.href) && <OpenInNew fontSize="small" />}
              </ListItemButton>
            ))}
            <ListItemButton {...linkProps(repositoryUrl)} onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="GitHub" />
              <OpenInNew fontSize="small" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
