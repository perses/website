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
