// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TableOfContents } from './TableOfContents';

type Notify = (entries: { isIntersecting: boolean; target: Element }[]) => void;
let notify: Notify;

const heading = (id: string) => document.getElementById(id)!;
const isActive = (name: string) => screen.getByRole('link', { name }).getAttribute('aria-current') === 'location';

describe('TableOfContents', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('highlights the first visible section, tracking the visibility across the observer calls', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: Notify) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    document.body.innerHTML = '<h2 id="install"></h2><h2 id="configure"></h2><h2 id="run"></h2>';
    render(
      <TableOfContents
        items={[
          { id: 'install', title: 'Install', depth: 2 },
          { id: 'configure', title: 'Configure', depth: 2 },
          { id: 'run', title: 'Run', depth: 2 },
        ]}
      />,
    );

    act(() =>
      notify([
        { isIntersecting: true, target: heading('install') },
        { isIntersecting: true, target: heading('configure') },
      ]),
    );
    expect(isActive('Install')).toBe(true);
    // Only the change is reported: "configure" is still visible and becomes the first visible section.
    act(() => notify([{ isIntersecting: false, target: heading('install') }]));
    expect(isActive('Configure')).toBe(true);
    // No section in the area: the last active one stays highlighted.
    act(() => notify([{ isIntersecting: false, target: heading('configure') }]));
    expect(isActive('Configure')).toBe(true);
  });
});
