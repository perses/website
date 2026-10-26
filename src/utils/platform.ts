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

export interface Platform {
  /** Operating system, using the Go naming (`linux`, `darwin`, `windows`). */
  os?: string;
  /** Architecture, using the Go naming (`amd64`, `arm64`, `armv6`). */
  arch?: string;
}

export interface PlatformHints {
  userAgent: string;
  /** `navigator.userAgentData.platform`, available in Chromium based browsers. */
  platform?: string;
  /** `architecture` and `bitness` from `navigator.userAgentData.getHighEntropyValues()`. */
  architecture?: string;
  bitness?: string;
}

function detectOs({ userAgent, platform }: PlatformHints): string | undefined {
  const value = `${platform ?? ''} ${userAgent}`;
  if (/android|iphone|ipad|ipod/i.test(value)) {
    return undefined;
  }
  if (/mac ?os|macintosh/i.test(value)) {
    return 'darwin';
  }
  if (/windows/i.test(value)) {
    return 'windows';
  }
  if (/linux|cros|x11/i.test(value)) {
    return 'linux';
  }
  return undefined;
}

function detectArch({ userAgent, architecture, bitness }: PlatformHints, os: string | undefined): string | undefined {
  if (architecture !== undefined && architecture !== '') {
    if (architecture === 'arm') {
      return bitness === '32' ? 'armv6' : 'arm64';
    }
    if (architecture === 'x86') {
      return bitness === '32' ? undefined : 'amd64';
    }
    return undefined;
  }
  if (/aarch64|arm64/i.test(userAgent)) {
    return 'arm64';
  }
  if (/armv[67]/i.test(userAgent)) {
    return 'armv6';
  }
  // Safari and Firefox always report an Intel processor on macOS, even on Apple Silicon: the architecture is unknown.
  if (os === 'darwin') {
    return undefined;
  }
  if (/x86_64|x64|amd64|win64|wow64/i.test(userAgent)) {
    return 'amd64';
  }
  return undefined;
}

/**
 * detectPlatform guesses the operating system and the architecture of the visitor from the information exposed by
 * the browser. A value is undefined when it can't be determined reliably.
 */
export function detectPlatform(hints: PlatformHints): Platform {
  const os = detectOs(hints);
  return { os, arch: detectArch(hints, os) };
}

interface NavigatorUAData {
  platform: string;
  getHighEntropyValues: (hints: string[]) => Promise<{ architecture?: string; bitness?: string }>;
}

/**
 * detectCurrentPlatform detects the platform of the browser running the page.
 */
export async function detectCurrentPlatform(): Promise<Platform> {
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  let highEntropy: { architecture?: string; bitness?: string } = {};
  try {
    highEntropy = (await uaData?.getHighEntropyValues(['architecture', 'bitness'])) ?? {};
  } catch {
    // The browser refused to give the information, fall back to the user agent.
  }
  return detectPlatform({
    userAgent: navigator.userAgent,
    platform: uaData?.platform,
    architecture: highEntropy.architecture,
    bitness: highEntropy.bitness,
  });
}
