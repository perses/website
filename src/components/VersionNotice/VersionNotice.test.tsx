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
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { VersionNotice, type VersionNoticeProps } from './VersionNotice';

function renderNotice(props: VersionNoticeProps) {
  const Stub = createRoutesStub([{ path: '*', Component: () => <VersionNotice {...props} /> }]);
  render(<Stub initialEntries={['/docs/perses/v0.54/overview/']} />);
}

const latest = { id: 'v0.55', href: '/docs/perses/latest/overview/' };

describe('VersionNotice', () => {
  it('warns that the page is the documentation of an older version', async () => {
    renderNotice({ source: 'Perses', version: 'v0.54', latest });
    expect((await screen.findByRole('alert')).textContent).toBe(
      'You are reading the documentation of Perses v0.54. Go to the latest version (v0.55).',
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/docs/perses/latest/overview/');
  });

  it('tells that the preview of the next version is not released yet', async () => {
    renderNotice({ source: 'Perses', version: 'v0.56', prerelease: 'v0.56.0-rc.1', latest });
    expect((await screen.findByRole('alert')).textContent).toBe(
      'You are reading the documentation of Perses v0.56, which is not released yet (latest pre-release: ' +
        'v0.56.0-rc.1). Go to the latest version (v0.55).',
    );
    expect(screen.getByRole('link', { name: 'Go to the latest version (v0.55).' }).getAttribute('href')).toBe(
      '/docs/perses/latest/overview/',
    );
  });

  it('does not link to a latest version while no version is released', async () => {
    renderNotice({ source: 'Perses', version: 'v0.1', prerelease: 'v0.1.0-beta.2' });
    expect((await screen.findByRole('alert')).textContent).toBe(
      'You are reading the documentation of Perses v0.1, which is not released yet (latest pre-release: v0.1.0-beta.2).',
    );
    expect(screen.queryByRole('link')).toBeNull();
  });
});
