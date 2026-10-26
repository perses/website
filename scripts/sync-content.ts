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

// Synchronizes the content coming from other repositories:
// - the documentation of every source declared in website.yaml, for each published version,
// - the latest releases displayed on the download pages.
//
// Flags:
//   --force                   download every documentation version again, even if it didn't change
//   --skip-downloads          don't fetch the releases from GitHub
//   --downloads-if-missing    fetch the releases only if they were never fetched (used by `pnpm dev`)
import { existsSync } from 'node:fs';
import { downloadsPath, syncDownloads } from '../src/content/downloads.server.ts';
import { syncSources } from '../src/content/sync.server.ts';

const args = new Set(process.argv.slice(2));

await syncSources({ force: args.has('--force') });

const skipDownloads = args.has('--skip-downloads') || (args.has('--downloads-if-missing') && existsSync(downloadsPath()));
if (!skipDownloads) {
  try {
    await syncDownloads();
  } catch (error) {
    // The download pages fall back to links to GitHub when the releases can't be fetched.
    console.warn(`⚠ unable to fetch the releases from GitHub: ${String(error)}`);
  }
}
