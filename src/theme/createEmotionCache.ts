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

import createCache, { type Options } from '@emotion/cache';

/**
 * createEmotionCache creates the Emotion cache used by MUI. The styles are wrapped in a `mui` cascade layer so the
 * global styles of the website can override them without specificity issues.
 */
export function createEmotionCache(options?: Partial<Options>) {
  const cache = createCache({ key: 'mui', ...options });
  const insert = cache.insert;
  cache.insert = (...args) => {
    // Styles defining the layer order (`@layer ...` without block) must stay as is.
    if (!/^@layer\s[^{]*$/.test(args[1].styles)) {
      args[1].styles = `@layer mui {${args[1].styles}}`;
    }
    return insert(...args);
  };
  return cache;
}
