import { loadConfig } from '../../content/config.server';
import { listSitemapEntries } from '../../content/paths.server';

export async function loader() {
  const siteUrl = loadConfig().site.url.replace(/\/$/, '');
  const entries = await listSitemapEntries();
  const urls = entries.map(
    ({ path, lastmod }) =>
      `  <url><loc>${siteUrl}${path}</loc>${lastmod === undefined ? '' : `<lastmod>${lastmod}</lastmod>`}</url>`,
  );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
