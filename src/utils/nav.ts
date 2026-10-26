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

import type { NavNode } from '../content/types';

export function normalizePath(path: string): string {
  const withoutHash = path.split('#')[0]?.split('?')[0] ?? '';
  return withoutHash.endsWith('/') ? withoutHash : `${withoutHash}/`;
}

export function isActive(node: NavNode, pathname: string): boolean {
  return node.href !== undefined && !node.external && normalizePath(node.href) === normalizePath(pathname);
}

export function containsActive(node: NavNode, pathname: string): boolean {
  return isActive(node, pathname) || (node.children ?? []).some((child) => containsActive(child, pathname));
}

/**
 * findTrail returns the list of nodes from the root of the navigation to the current page.
 */
export function findTrail(nodes: NavNode[], pathname: string): NavNode[] {
  for (const node of nodes) {
    if (isActive(node, pathname)) {
      return [node];
    }
    const trail = findTrail(node.children ?? [], pathname);
    if (trail.length > 0) {
      return [node, ...trail];
    }
  }
  return [];
}

/**
 * flattenPages returns the internal pages of the navigation, in the reading order.
 */
export function flattenPages(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => [
    ...(node.href !== undefined && !node.external ? [node] : []),
    ...flattenPages(node.children ?? []),
  ]);
}

/**
 * siblings returns the previous and the next pages of the current one, restricted to the pages of the same
 * documentation source.
 */
export function siblings(nodes: NavNode[], pathname: string, prefix: string): { previous?: NavNode; next?: NavNode } {
  const pages = flattenPages(nodes).filter((node) => node.href?.startsWith(prefix));
  const index = pages.findIndex((node) => isActive(node, pathname));
  if (index === -1) {
    return {};
  }
  return { previous: pages[index - 1], next: pages[index + 1] };
}
