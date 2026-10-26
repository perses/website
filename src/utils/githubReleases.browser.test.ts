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

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchLatestRelease } from './githubReleases';

const release = {
  tag_name: 'v0.56.0',
  name: 'v0.56.0',
  html_url: 'https://github.com/perses/perses/releases/tag/v0.56.0',
  draft: false,
  prerelease: false,
  published_at: '2026-11-01T10:00:00Z',
  body: 'a long release note that is not cached',
  assets: [],
};

describe('fetchLatestRelease', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('shares the requests in progress and caches the responses', async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => new Response(JSON.stringify(release)));
    vi.stubGlobal('fetch', fetchMock);
    const [first, second] = await Promise.all([fetchLatestRelease('perses/perses'), fetchLatestRelease('perses/perses')]);
    expect(first.tag_name).toBe('v0.56.0');
    expect(second).toBe(first);
    expect(await fetchLatestRelease('perses/perses')).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveProperty('body');
  });

  it('stops querying GitHub until the end of the rate limit window', async () => {
    const reset = Math.floor(Date.now() / 1000) + 3600;
    const fetchMock = vi.fn<() => Promise<Response>>(
      async () =>
        new Response('{}', {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchLatestRelease('perses/perses-operator')).rejects.toThrow('403');
    await expect(fetchLatestRelease('perses/metrics-usage')).rejects.toThrow('rate limit');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
