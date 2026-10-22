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
