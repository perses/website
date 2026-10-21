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
