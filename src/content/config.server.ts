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

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const linkSchema = z.object({
  title: z.string(),
  href: z.string(),
});

const versioningSchema = z.object({
  minVersion: z.string().regex(/^v\d+\.\d+$/, 'minVersion must look like vX.Y'),
  releaseBranch: z.string().default('release/v{major}.{minor}'),
});

const sourceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'source id must be lowercase alphanumeric with dashes'),
    title: z.string(),
    description: z.string(),
    repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'repository must look like owner/name'),
    docsDir: z.string().default('docs'),
    legacyPath: z.string().optional(),
    branch: z.string().optional(),
    versioning: versioningSchema.optional(),
  })
  .refine((s) => !(s.branch && s.versioning), {
    message: 'a source cannot define both "branch" and "versioning"',
  });

const footerLinkSchema = z.object({
  name: z.string(),
  icon: z.enum(['github', 'slack', 'linkedin', 'x', 'docker', 'rss']),
  href: z.string(),
});

const binarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  repository: z.string(),
  install: z.array(z.object({ label: z.string(), command: z.string() })).default([]),
});

export const websiteConfigSchema = z.object({
  site: z.object({
    title: z.string(),
    description: z.string(),
    url: z.url(),
    repository: z.url(),
  }),
  menu: z.array(linkSchema),
  docs: z.object({
    sources: z.array(sourceSchema).min(1),
  }),
  blog: z.object({
    title: z.string(),
    description: z.string(),
    postsPerPage: z.number().int().positive().default(10),
  }),
  footer: z.object({
    trademark: z.string(),
    links: z.array(footerLinkSchema),
  }),
  downloads: z.object({
    binaries: z.array(binarySchema),
    plugins: z.object({ repository: z.string() }),
  }),
});

export type WebsiteConfig = z.infer<typeof websiteConfigSchema>;
export type SourceConfig = WebsiteConfig['docs']['sources'][number];

export function rootDir(): string {
  return process.env.WEBSITE_ROOT ?? process.cwd();
}

export function cacheDir(): string {
  return join(rootDir(), '.cache');
}

export function contentDir(): string {
  return join(rootDir(), 'content');
}

export function parseConfig(raw: string): WebsiteConfig {
  const config = websiteConfigSchema.parse(parse(raw));
  const ids = new Set<string>();
  for (const source of config.docs.sources) {
    if (ids.has(source.id)) {
      throw new Error(`duplicated docs source id "${source.id}"`);
    }
    ids.add(source.id);
  }
  return config;
}

let cachedConfig: WebsiteConfig | undefined;

export function loadConfig(): WebsiteConfig {
  if (cachedConfig === undefined || isDev()) {
    cachedConfig = parseConfig(readFileSync(join(rootDir(), 'website.yaml'), 'utf8'));
  }
  return cachedConfig;
}

/**
 * isDev is true when running the Vite dev server. In this mode, every cache is bypassed so that edits on the
 * content are visible on the next page load.
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
