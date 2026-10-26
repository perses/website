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
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the trademark notice and the social links only', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <Footer
            trademark="The Linux Foundation® (TLF) has registered trademarks. See [Trademark Usage](https://www.linuxfoundation.org/trademark-usage/)."
            links={[
              { name: 'Slack', icon: 'slack', href: 'https://slack.example.com' },
              { name: 'RSS', icon: 'rss', href: '/blog/rss.xml' },
            ]}
          />
        ),
      },
    ]);
    render(<Stub />);
    expect(screen.getByText(/The Linux Foundation® \(TLF\) has registered trademarks/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'Trademark Usage' }).getAttribute('href')).toBe(
      'https://www.linuxfoundation.org/trademark-usage/',
    );
    expect(screen.getByRole('link', { name: 'Slack' }).getAttribute('target')).toBe('_blank');
    expect(screen.getByRole('link', { name: 'RSS' }).getAttribute('target')).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});
