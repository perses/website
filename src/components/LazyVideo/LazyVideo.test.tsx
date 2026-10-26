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
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyVideo } from './LazyVideo';

let intersect: (visible: boolean) => void;

function setup(reducedMotion: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reducedMotion && query.includes('reduce') }));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersect = (visible) => callback([{ isIntersecting: visible }]);
      }
      observe() {}
      disconnect() {}
    },
  );
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { value: false, configurable: true });
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { value: true, configurable: true });
    this.dispatchEvent(new Event('pause'));
  });
  return play;
}

describe('LazyVideo', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { value: true, configurable: true, writable: true });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('plays when visible and can be paused with a button, which stays paused when visible again', () => {
    const play = setup(false);
    render(<LazyVideo src="/demo.mp4" title="Demo" />);
    act(() => intersect(true));
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Pause the video: Demo' }));
    expect(screen.getByRole('button', { name: 'Play the video: Demo' })).toBeDefined();

    act(() => intersect(false));
    act(() => intersect(true));
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('does not play automatically when the visitor prefers reduced motion', () => {
    const play = setup(true);
    render(<LazyVideo src="/demo.mp4" title="Demo" />);
    act(() => intersect(true));
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Play the video: Demo' }));
    expect(play).toHaveBeenCalledTimes(1);
  });
});
