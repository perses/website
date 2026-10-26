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

export type InlineToken = { type: 'text'; value: string } | { type: 'link'; label: string; href: string };

/**
 * parseInlineLinks splits a text containing markdown links (`[label](href)`) into tokens. It is used for short texts
 * defined in the configuration, which don't need a full markdown renderer.
 */
export function parseInlineLinks(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regexp = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(regexp)) {
    if (match.index > last) {
      tokens.push({ type: 'text', value: text.slice(last, match.index) });
    }
    tokens.push({ type: 'link', label: match[1] ?? '', href: match[2] ?? '' });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    tokens.push({ type: 'text', value: text.slice(last) });
  }
  return tokens;
}
