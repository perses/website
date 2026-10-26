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

import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  // The website is entirely static: every page is prerendered to HTML at build time, then hydrated in the browser.
  ssr: false,
  prerender: {
    concurrency: 8,
    paths: async () => {
      const { listAllPaths } = await import('./src/content/paths.server.ts');
      return listAllPaths();
    },
  },
  buildEnd: async ({ reactRouterConfig }) => {
    const { finalizeBuild } = await import('./src/content/build.server.ts');
    await finalizeBuild(`${reactRouterConfig.buildDirectory}/client`);
  },
} satisfies Config;
