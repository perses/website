// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the trademark notice, the social links and the adopters link', () => {
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
    expect(screen.getByRole('link', { name: 'Adopters' }).getAttribute('href')).toBe('/adopters/');
    expect(screen.queryByRole('link', { name: 'Blog' })).toBeNull();
  });
});
