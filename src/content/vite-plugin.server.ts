import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import type { Connect, Plugin } from 'vite';
import { contentDir, rootDir } from './config.server.ts';
import { loadManifest, localOverrides, manifestPath } from './manifest.server.ts';

const mimeTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
};

function sendFile(res: Parameters<Connect.NextHandleFunction>[1], path: string) {
  res.setHeader('Content-Type', mimeTypes[extname(path).toLowerCase()] ?? 'application/octet-stream');
  res.setHeader('Content-Length', statSync(path).size);
  createReadStream(path).pipe(res);
}

/**
 * safeJoin joins a base directory and a relative path coming from a URL, refusing to escape the base directory.
 */
function safeJoin(base: string, relPath: string): string | undefined {
  const path = normalize(join(base, relPath));
  return path.startsWith(normalize(base) + sep) ? path : undefined;
}

/**
 * contentPlugin integrates the documentation content with the Vite dev server:
 * - it serves the images and files of the documentation sources under `/docs-assets/`,
 * - it serves the search index of the last build under `/pagefind/`,
 * - it reloads the page when the content changes.
 */
export function contentPlugin(): Plugin {
  return {
    name: 'perses-website-content',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/docs-assets', (req, res, next) => {
        const [sourceId, versionId, ...rest] = decodeURIComponent((req.url ?? '').split('?')[0] ?? '')
          .split('/')
          .filter((s) => s !== '');
        let version;
        try {
          version = loadManifest().sources[sourceId ?? '']?.versions.find((v) => v.id === versionId);
        } catch {
          version = undefined;
        }
        const path = version && safeJoin(version.dir, rest.join('/'));
        if (path === undefined || !existsSync(path) || !statSync(path).isFile()) {
          next();
          return;
        }
        sendFile(res, path);
      });

      server.middlewares.use('/pagefind', (req, res, next) => {
        const path = safeJoin(join(rootDir(), 'build', 'client', 'pagefind'), (req.url ?? '').split('?')[0] ?? '');
        if (path === undefined || !existsSync(path) || !statSync(path).isFile()) {
          next();
          return;
        }
        sendFile(res, path);
      });

      const watched = [contentDir(), join(rootDir(), 'website.yaml'), manifestPath(), ...localOverrides().values()];
      server.watcher.add(watched);
      server.watcher.on('all', (_event, file) => {
        if (watched.some((path) => file === path || file.startsWith(path + sep))) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}
