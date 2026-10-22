import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import * as tar from 'tar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SourceConfig } from './config.server';
import { downloadDocs } from './sync.server';

const source = { id: 'perses', repository: 'perses/perses', docsDir: 'docs' } as SourceConfig;

async function archive(root: string): Promise<ArrayBuffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of tar.c({ gzip: true, cwd: root }, ['perses-abc'])) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  const buffer = Buffer.concat(chunks);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

describe('downloadDocs', () => {
  let dir: string;
  let destination: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'perses-website-sync-'));
    destination = join(dir, 'v0.55');
    mkdirSync(destination);
    writeFileSync(join(destination, 'overview.md'), 'previous version');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rmSync(dir, { recursive: true, force: true });
  });

  it('replaces the content with the docs directory of the archive', async () => {
    const repo = join(dir, 'repo');
    mkdirSync(join(repo, 'perses-abc', 'docs', 'concepts'), { recursive: true });
    writeFileSync(join(repo, 'perses-abc', 'docs', 'concepts', 'dashboard.md'), 'new version');
    writeFileSync(join(repo, 'perses-abc', 'README.md'), 'not part of the docs');
    const body = await archive(repo);
    vi.stubGlobal('fetch', async () => new Response(body));

    await downloadDocs(source, 'abc', destination);

    expect(readFileSync(join(destination, 'concepts', 'dashboard.md'), 'utf8')).toBe('new version');
    expect(existsSync(join(destination, 'overview.md'))).toBe(false);
    expect(existsSync(join(destination, 'README.md'))).toBe(false);
    expect(existsSync(`${destination}.staging`)).toBe(false);
    expect(existsSync(`${destination}.previous`)).toBe(false);
  });

  it('keeps the previous content when the download fails in the middle', async () => {
    const stream = new Readable({
      read() {
        this.destroy(new Error('connection reset'));
      },
    });
    vi.stubGlobal('fetch', async () => new Response(Readable.toWeb(stream) as ReadableStream));

    await expect(downloadDocs(source, 'abc', destination)).rejects.toThrow('connection reset');

    expect(readFileSync(join(destination, 'overview.md'), 'utf8')).toBe('previous version');
    expect(existsSync(`${destination}.staging`)).toBe(false);
  });
});
