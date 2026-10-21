import { describe, expect, it } from 'vitest';
import { buildArchive } from './blog.server';

const post = (title: string, date: string) => ({ title, date, url: `/blog/${title}/` });

describe('buildArchive', () => {
  it('groups the posts by year, keeping their order', () => {
    expect(buildArchive([post('c', '2026-10-21'), post('b', '2026-01-31'), post('a', '2025-06-10')])).toEqual([
      { year: '2026', posts: [post('c', '2026-10-21'), post('b', '2026-01-31')] },
      { year: '2025', posts: [post('a', '2025-06-10')] },
    ]);
  });
});
