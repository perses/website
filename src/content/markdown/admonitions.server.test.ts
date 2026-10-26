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
import { admonitionSeverity, convertMkdocsAdmonitions } from './admonitions.server';

describe('convertMkdocsAdmonitions', () => {
  it('converts an admonition with a title', () => {
    const input = ['!!! info "Implementation details"', '    First line.', '', '    Second paragraph.', '', 'After.'].join('\n');
    expect(convertMkdocsAdmonitions(input)).toBe(
      ['> [!INFO] Implementation details', '>', '> First line.', '>', '> Second paragraph.', '', 'After.'].join('\n'),
    );
  });

  it('converts collapsible admonitions', () => {
    expect(convertMkdocsAdmonitions('??? tip\n    hidden')).toBe('> [!TIP]-\n>\n> hidden');
    expect(convertMkdocsAdmonitions('???+ tip\n    shown')).toBe('> [!TIP]+\n>\n> shown');
  });

  it('keeps the code blocks of an admonition and ignores the syntax inside code blocks', () => {
    const input = ['!!! note', '    ```yaml', '    a: b', '    ```', '', '```', '!!! warning', '    not an admonition', '```'].join(
      '\n',
    );
    expect(convertMkdocsAdmonitions(input)).toBe(
      ['> [!NOTE]', '>', '> ```yaml', '> a: b', '> ```', '', '```', '!!! warning', '    not an admonition', '```'].join('\n'),
    );
  });

  it('converts nested and indented admonitions', () => {
    const input = ['1. Step', '', '    !!! warning', '        Careful', '', '        !!! note', '            Nested'].join('\n');
    expect(convertMkdocsAdmonitions(input)).toBe(
      ['1. Step', '', '    > [!WARNING]', '    >', '    > Careful', '    >', '    > > [!NOTE]', '    > >', '    > > Nested'].join('\n'),
    );
  });
});

describe('admonitionSeverity', () => {
  it('maps the mkdocs and GitHub types to a severity', () => {
    expect(admonitionSeverity('NOTE')).toBe('info');
    expect(admonitionSeverity('tip')).toBe('success');
    expect(admonitionSeverity('caution')).toBe('warning');
    expect(admonitionSeverity('danger')).toBe('error');
    expect(admonitionSeverity('unknown')).toBe('info');
  });
});
