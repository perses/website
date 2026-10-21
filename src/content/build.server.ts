import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as pagefind from 'pagefind';
import { getDocsIndex } from './docs.server.ts';

/**
 * copyDocsAssets copies the files of the documentation sources that are not markdown (images, examples...) to
 * `/docs-assets/<source>/<version>/`.
 */
async function copyDocsAssets(clientDir: string): Promise<number> {
  let count = 0;
  for (const source of getDocsIndex().sources.values()) {
    for (const version of source.versions) {
      for (const asset of version.assets) {
        const target = join(clientDir, 'docs-assets', source.config.id, version.manifest.id, asset);
        await mkdir(dirname(target), { recursive: true });
        await copyFile(join(version.manifest.dir, asset), target);
        count++;
      }
    }
  }
  return count;
}

/**
 * buildSearchIndex indexes the prerendered pages with Pagefind. Only the elements marked with `data-pagefind-body`
 * are indexed, so the redirections and the duplicated pages are excluded.
 */
async function buildSearchIndex(clientDir: string): Promise<number> {
  const { index, errors } = await pagefind.createIndex({});
  if (index === undefined) {
    throw new Error(`unable to create the search index: ${errors.join(', ')}`);
  }
  const result = await index.addDirectory({ path: clientDir });
  if (result.errors.length > 0) {
    throw new Error(`unable to index the website: ${result.errors.join(', ')}`);
  }
  const written = await index.writeFiles({ outputPath: join(clientDir, 'pagefind') });
  if (written.errors.length > 0) {
    throw new Error(`unable to write the search index: ${written.errors.join(', ')}`);
  }
  await pagefind.close();
  return result.page_count;
}

/**
 * finalizeBuild runs after the prerendering of the pages.
 */
export async function finalizeBuild(clientDir: string): Promise<void> {
  const assets = await copyDocsAssets(clientDir);
  console.log(`✓ ${assets} documentation assets copied`);
  // nginx and most static hosts serve /404.html for unknown pages.
  const notFound = join(clientDir, '404', 'index.html');
  if (existsSync(notFound)) {
    await copyFile(notFound, join(clientDir, '404.html'));
  }
  const pages = await buildSearchIndex(clientDir);
  console.log(`✓ ${pages} pages indexed for the search`);
}
