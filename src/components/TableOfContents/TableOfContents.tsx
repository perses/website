import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import type { TocItem } from '../../content/types';

/**
 * TableOfContents lists the sections of the page and highlights the one being read.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) {
      return;
    }
    // The observer only reports the headings whose visibility changed: the visible ones are tracked across the calls.
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // When no heading is in the area, the section being read is still the last active one.
        const first = items.find((item) => visible.has(item.id));
        if (first !== undefined) {
          setActive(first.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    for (const heading of headings) {
      observer.observe(heading);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }
  return (
    <Box component="nav" aria-label="On this page">
      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
        On this page
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {items.map((item) => (
          <Box component="li" key={item.id} sx={{ pl: item.depth === 3 ? 1.5 : 0, py: 0.5 }}>
            <Link
              href={`#${item.id}`}
              underline="hover"
              color={active === item.id ? 'primary' : 'text.secondary'}
              aria-current={active === item.id ? 'location' : undefined}
              sx={{ fontSize: '0.8125rem', fontWeight: active === item.id ? 600 : 400, display: 'block' }}
            >
              {item.title}
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
