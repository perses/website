// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRoutesStub, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { VersionSelect } from './VersionSelect';

function Location() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

describe('VersionSelect', () => {
  it('navigates to the selected version', async () => {
    const versions = [
      { id: 'v0.55', label: 'v0.55 (latest)', href: '/docs/perses/latest/overview/', latest: true },
      { id: 'v0.54', label: 'v0.54', href: '/docs/perses/v0.54/overview/', latest: false },
    ];
    const Stub = createRoutesStub([
      {
        path: '*',
        Component: () => (
          <>
            <VersionSelect versions={versions} current="v0.55" />
            <Location />
          </>
        ),
      },
    ]);
    render(<Stub initialEntries={['/docs/perses/latest/overview/']} />);
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('v0.54'));
    expect((await screen.findByTestId('location')).textContent).toBe('/docs/perses/v0.54/overview/');
  });
});
