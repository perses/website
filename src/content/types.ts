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

import type { Root as HastRoot } from 'hast';

export interface TocItem {
  id: string;
  title: string;
  depth: 2 | 3;
}

export interface MarkdownContent {
  title: string;
  toc: TocItem[];
  hast: HastRoot;
  hasMermaid: boolean;
}

export interface NavNode {
  title: string;
  href?: string;
  external?: boolean;
  children?: NavNode[];
}

export interface VersionOption {
  id: string;
  label: string;
  href: string;
  latest: boolean;
}

export interface SourceSummary {
  id: string;
  title: string;
  description: string;
  href: string;
  versioned: boolean;
  latestRelease?: string;
}

export interface DocsPageData {
  source: SourceSummary;
  /** Version displayed in the URL (`latest`, `vX.Y`), undefined for not versioned sources. */
  version?: string;
  /** Concrete version id (`vX.Y`), undefined for not versioned sources. */
  resolvedVersion?: string;
  isLatest: boolean;
  versions: VersionOption[];
  nav: NavNode[];
  sources: SourceSummary[];
  path: string;
  canonical: string;
  editUrl?: string;
  content: MarkdownContent;
}

export interface BlogCategory {
  name: string;
  slug: string;
}

export interface BlogPostSummary {
  slug: string;
  url: string;
  title: string;
  date: string;
  description: string;
  categories: BlogCategory[];
  authors: string[];
  readingTime: number;
  excerpt: HastRoot;
  hasMore: boolean;
}

export interface BlogArchiveYear {
  year: string;
  posts: { title: string; url: string; date: string }[];
}

export interface BlogPost extends BlogPostSummary {
  content: MarkdownContent;
}

export interface RedirectData {
  to: string;
}

export interface Adopter {
  name: string;
  url: string;
  logo: { light: string; dark?: string };
}
