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

import { describe, expect, it } from 'vitest';
import { mapLegacyPath, mapLegacyUrl } from './legacy.server';

describe('mapLegacyPath', () => {
  it('redirects the pages of versioned sources to the latest version', () => {
    expect(mapLegacyPath('/perses/docs/concepts/dashboard/')).toBe('/docs/perses/latest/concepts/dashboard/');
    expect(mapLegacyPath('/perses/docs/dac/cue/')).toBe('/docs/perses/latest/dac/cue/');
    expect(mapLegacyPath('/perses/docs/')).toBe('/docs/perses/latest/');
    expect(mapLegacyPath('/perses-operator/docs/user-guide/')).toBe('/docs/operator/latest/user-guide/');
  });

  it('redirects the pages of not versioned sources', () => {
    expect(mapLegacyPath('/plugins/docs/prometheus/README.md')).toBe('/docs/plugins/prometheus/');
    expect(mapLegacyPath('/helm-charts/docs/installation/index.html')).toBe('/docs/helm-charts/installation/');
  });

  it('ignores the other paths', () => {
    expect(mapLegacyPath('/blog/')).toBeUndefined();
    expect(mapLegacyPath('/persesdocs/')).toBeUndefined();
  });
});

describe('mapLegacyUrl', () => {
  it('converts the absolute links to the website into relative links', () => {
    expect(mapLegacyUrl('https://perses.dev/perses/docs/api/dashboard/#panel-specification')).toBe(
      '/docs/perses/latest/api/dashboard/#panel-specification',
    );
    expect(mapLegacyUrl('https://perses.dev/adopters/')).toBe('/adopters/');
  });

  it('leaves the other URLs untouched', () => {
    expect(mapLegacyUrl('https://demo.perses.dev/')).toBeUndefined();
    expect(mapLegacyUrl('https://github.com/perses/perses')).toBeUndefined();
    expect(mapLegacyUrl('/blog/')).toBeUndefined();
  });
});
