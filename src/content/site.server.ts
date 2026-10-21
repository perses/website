import { loadConfig } from './config.server.ts';

export interface SiteData {
  title: string;
  description: string;
  url: string;
  repositoryUrl: string;
  menu: { title: string; href: string }[];
  footer: {
    trademark: string;
    links: { name: string; icon: 'github' | 'slack' | 'linkedin' | 'x' | 'docker' | 'rss'; href: string }[];
  };
}

export function loadSiteData(): SiteData {
  const config = loadConfig();
  return {
    title: config.site.title,
    description: config.site.description,
    url: config.site.url,
    repositoryUrl: config.footer.links.find((link) => link.icon === 'github')?.href ?? 'https://github.com/perses',
    menu: config.menu,
    footer: config.footer,
  };
}
