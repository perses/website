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

const DEFAULT_SITE_URL = 'https://perses.dev';
const DEFAULT_IMAGE = '/assets/images/home/perses_overview.gif';

export interface PageMetaOptions {
  title?: string;
  description: string;
  /** Path of the canonical URL of the page. */
  canonical: string;
  siteUrl?: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
}

/**
 * siteUrlFrom finds the URL of the website in the data of the layout route.
 */
export function siteUrlFrom(matches: readonly unknown[]): string {
  for (const match of matches) {
    const data = (match as { loaderData?: unknown } | undefined)?.loaderData;
    if (data !== null && typeof data === 'object' && 'url' in data && typeof data.url === 'string') {
      return data.url.replace(/\/$/, '');
    }
  }
  return DEFAULT_SITE_URL;
}

export function pageMeta({
  title,
  description,
  canonical,
  siteUrl = DEFAULT_SITE_URL,
  type = 'website',
  image = DEFAULT_IMAGE,
  noindex = false,
}: PageMetaOptions) {
  const fullTitle = title ? `${title} | Perses` : 'Perses';
  const url = `${siteUrl}${canonical}`;
  return [
    { title: fullTitle },
    { name: 'description', content: description },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:image', content: `${siteUrl}${image}` },
    { property: 'og:site_name', content: 'Perses' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { tagName: 'link', rel: 'canonical', href: url },
    ...(noindex ? [{ name: 'robots', content: 'noindex' }] : []),
  ];
}
