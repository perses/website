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

import type { Blockquote, Paragraph, Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';

const admonitionLine = /^(\s*)(!!!|\?\?\?\+?)\s+([\w-]+)(?:\s+"(.*)")?\s*$/;
const fenceLine = /^\s*(`{3,}|~{3,})/;

function indentOf(line: string): number {
  let count = 0;
  for (const char of line) {
    if (char === ' ') {
      count++;
    } else if (char === '\t') {
      count += 4 - (count % 4);
    } else {
      break;
    }
  }
  return count;
}

function removeIndent(line: string, size: number): string {
  let removed = 0;
  let index = 0;
  while (index < line.length && removed < size) {
    const char = line[index];
    if (char === ' ') {
      removed++;
    } else if (char === '\t') {
      removed += 4 - (removed % 4);
    } else {
      break;
    }
    index++;
  }
  return line.slice(index);
}

/**
 * convertMkdocsAdmonitions converts the admonitions written with the mkdocs syntax (`!!! note "Title"` followed by
 * an indented block) into blockquotes using the alert syntax (`> [!NOTE] Title`). This way, a single remark plugin
 * handles both syntaxes. Code blocks are left untouched.
 */
export function convertMkdocsAdmonitions(markdown: string): string {
  const lines = markdown.split('\n');
  const output: string[] = [];
  let fence: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const fenceMatch = fenceLine.exec(line);
    if (fence !== undefined) {
      output.push(line);
      if (fenceMatch?.[1] && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
        fence = undefined;
      }
      continue;
    }
    if (fenceMatch?.[1]) {
      fence = fenceMatch[1];
      output.push(line);
      continue;
    }

    const match = admonitionLine.exec(line);
    if (!match) {
      output.push(line);
      continue;
    }
    const indent = indentOf(line);
    const pad = ' '.repeat(indent);
    const [, , marker, type = 'note', title = ''] = match;
    const body: string[] = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const next = lines[j] ?? '';
      if (next.trim() === '') {
        body.push('');
        continue;
      }
      if (indentOf(next) < indent + 4) {
        break;
      }
      body.push(removeIndent(next, indent + 4));
    }
    // Trailing blank lines don't belong to the admonition.
    while (body.length > 0 && body[body.length - 1] === '') {
      body.pop();
      j--;
    }
    const collapse = marker === '???' ? '-' : marker === '???+' ? '+' : '';
    output.push(`${pad}> [!${type.toUpperCase()}]${collapse}${title ? ` ${title}` : ''}`);
    output.push(`${pad}>`);
    for (const bodyLine of convertMkdocsAdmonitions(body.join('\n')).split('\n')) {
      output.push(bodyLine === '' ? `${pad}>` : `${pad}> ${bodyLine}`);
    }
    i = j - 1;
  }
  return output.join('\n');
}

export type AdmonitionSeverity = 'info' | 'success' | 'warning' | 'error';

const severities: Record<string, AdmonitionSeverity> = {
  note: 'info',
  info: 'info',
  todo: 'info',
  abstract: 'info',
  summary: 'info',
  tldr: 'info',
  question: 'info',
  help: 'info',
  faq: 'info',
  example: 'info',
  quote: 'info',
  cite: 'info',
  important: 'info',
  tip: 'success',
  hint: 'success',
  success: 'success',
  check: 'success',
  done: 'success',
  warning: 'warning',
  caution: 'warning',
  attention: 'warning',
  danger: 'error',
  error: 'error',
  failure: 'error',
  fail: 'error',
  missing: 'error',
  bug: 'error',
};

export function admonitionSeverity(type: string): AdmonitionSeverity {
  return severities[type.toLowerCase()] ?? 'info';
}

const alertMarker = /^\[!([\w-]+)\]([+-])?[ \t]*([^\n]*)(?:\n|$)/;

/**
 * remarkAdmonitions transforms the blockquotes starting with `[!TYPE]` (GitHub alerts, optionally followed by a
 * title and a `+`/`-` collapsible marker) into `aside` elements rendered as admonitions.
 */
export function remarkAdmonitions() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const [first] = node.children;
      if (first?.type !== 'paragraph') {
        return;
      }
      const paragraph: Paragraph = first;
      const [text] = paragraph.children;
      if (text?.type !== 'text') {
        return;
      }
      const match = alertMarker.exec((text as Text).value);
      if (!match) {
        return;
      }
      const [whole, type = 'note', collapse, title = ''] = match;
      text.value = text.value.slice(whole.length);
      if (text.value === '') {
        paragraph.children.shift();
      }
      if (paragraph.children.length === 0) {
        node.children.shift();
      }
      node.data = {
        ...node.data,
        hName: 'aside',
        hProperties: {
          className: ['admonition'],
          dataType: type.toLowerCase(),
          dataSeverity: admonitionSeverity(type),
          dataTitle: title.trim() || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
          dataCollapsible: collapse === '-' ? 'closed' : collapse === '+' ? 'open' : undefined,
        },
      };
    });
  };
}
