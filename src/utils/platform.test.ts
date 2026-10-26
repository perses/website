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
import { detectPlatform } from './platform';

const userAgents = {
  chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15',
  firefoxLinux: 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
  firefoxLinuxArm: 'Mozilla/5.0 (X11; Linux aarch64; rv:144.0) Gecko/20100101 Firefox/144.0',
  raspberry: 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  edgeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
};

describe('detectPlatform', () => {
  it('uses the high entropy values of Chromium based browsers', () => {
    expect(detectPlatform({ userAgent: userAgents.chromeMac, platform: 'macOS', architecture: 'arm', bitness: '64' })).toEqual({
      os: 'darwin',
      arch: 'arm64',
    });
    expect(detectPlatform({ userAgent: userAgents.edgeWindows, platform: 'Windows', architecture: 'x86', bitness: '64' })).toEqual({
      os: 'windows',
      arch: 'amd64',
    });
  });

  it('falls back to the user agent', () => {
    expect(detectPlatform({ userAgent: userAgents.firefoxLinux })).toEqual({ os: 'linux', arch: 'amd64' });
    expect(detectPlatform({ userAgent: userAgents.firefoxLinuxArm })).toEqual({ os: 'linux', arch: 'arm64' });
    expect(detectPlatform({ userAgent: userAgents.raspberry })).toEqual({ os: 'linux', arch: 'armv6' });
    expect(detectPlatform({ userAgent: userAgents.edgeWindows })).toEqual({ os: 'windows', arch: 'amd64' });
  });

  it('does not guess the architecture of a Mac from the user agent', () => {
    expect(detectPlatform({ userAgent: userAgents.safariMac })).toEqual({ os: 'darwin', arch: undefined });
  });

  it('ignores the mobile platforms', () => {
    expect(detectPlatform({ userAgent: userAgents.android })).toEqual({ os: undefined, arch: undefined });
  });
});
