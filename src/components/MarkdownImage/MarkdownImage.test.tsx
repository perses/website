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
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownImage } from './MarkdownImage';

describe('MarkdownImage', () => {
  it('opens the image in full size with a button reachable with the keyboard', () => {
    render(<MarkdownImage src="/image.png" alt="Dashboard" />);
    const button = screen.getByRole('button', { name: 'Dashboard' });
    button.focus();
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('renders the images inside a link without a button', () => {
    render(<MarkdownImage src="/badge.svg" alt="Badge" data-in-link="true" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('img', { name: 'Badge' })).toBeDefined();
  });
});
