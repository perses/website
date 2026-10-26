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

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { searchScope } from '../../utils/search';

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: { title?: string };
  filters: Record<string, string[]>;
  sub_results?: { title: string; url: string; excerpt: string }[];
}

interface PagefindSearch {
  results: { id: string; data: () => Promise<PagefindResultData> }[];
}

interface Pagefind {
  options: (options: Record<string, unknown>) => Promise<void>;
  init: () => void;
  debouncedSearch: (query: string, options?: Record<string, unknown>, timeout?: number) => Promise<PagefindSearch | null>;
}

let pagefindPromise: Promise<Pagefind> | undefined;

function loadPagefind(): Promise<Pagefind> {
  if (pagefindPromise === undefined) {
    const url = '/pagefind/pagefind.js';
    pagefindPromise = (import(/* @vite-ignore */ url) as Promise<Pagefind>).then(async (pagefind) => {
      await pagefind.options({ excerptLength: 24 });
      pagefind.init();
      return pagefind;
    });
    pagefindPromise.catch(() => {
      pagefindPromise = undefined;
    });
  }
  return pagefindPromise;
}

function decode(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Excerpt renders the excerpt returned by Pagefind, where the matching words are surrounded by `<mark>`, without
 * injecting HTML.
 */
function Excerpt({ value }: { value: string }) {
  return (
    <>
      {value.split(/<mark>|<\/mark>/).map((part, index) =>
        index % 2 === 1 ? (
          <Box component="mark" key={index} sx={{ bgcolor: 'primary.light', color: 'inherit', borderRadius: 0.5, px: 0.25 }}>
            {decode(part)}
          </Box>
        ) : (
          decode(part)
        ),
      )}
    </>
  );
}

function toRelative(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, '').replace(/\/index\.html(#|$)/, '/$1').replace(/\.html(#|$)/, '/$1');
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindResultData[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'unavailable'>('idle');
  const [selected, setSelected] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const scope = searchScope(pathname);
  const latestQuery = useRef('');

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function search(value: string) {
    setQuery(value);
    latestQuery.current = value;
    if (value.trim() === '') {
      setResults([]);
      return;
    }
    setStatus('loading');
    try {
      const pagefind = await loadPagefind();
      const response = await pagefind.debouncedSearch(value, { filters: scope.filters }, 200);
      if (response === null || latestQuery.current !== value) {
        return;
      }
      const data = await Promise.all(response.results.slice(0, 12).map((result) => result.data()));
      setResults(data);
      setSelected(0);
      setStatus('idle');
    } catch {
      setStatus('unavailable');
    }
  }

  function close() {
    setOpen(false);
  }

  function go(url: string) {
    close();
    void navigate(toRelative(url));
  }

  function handleInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (event.key === 'Enter' && results[selected]) {
      event.preventDefault();
      go(results[selected].url);
    }
  }

  return (
    <>
      <Button
        color="inherit"
        onClick={() => setOpen(true)}
        startIcon={<SearchIcon />}
        aria-label="Search"
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          border: 1,
          borderColor: 'divider',
          color: 'text.secondary',
          px: 1.5,
          minWidth: 180,
          justifyContent: 'flex-start',
        }}
      >
        <Box component="span" sx={{ flexGrow: 1, textAlign: 'left' }}>
          Search
        </Box>
        <Box component="kbd" sx={{ fontSize: '0.75rem', border: 1, borderColor: 'divider', borderRadius: 1, px: 0.5 }}>
          ⌘K
        </Box>
      </Button>
      <IconButton
        color="inherit"
        aria-label="Search"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
      >
        <SearchIcon />
      </IconButton>
      <Dialog open={open} onClose={close} fullWidth maxWidth="md" sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}>
        <DialogContent sx={{ p: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder={scope.label ? `Search in ${scope.label}…` : 'Search the documentation and the blog…'}
            value={query}
            onChange={(event) => void search(event.target.value)}
            onKeyDown={handleInputKeyDown}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box component="kbd" sx={{ fontSize: '0.75rem', border: 1, borderColor: 'divider', borderRadius: 1, px: 0.5 }}>
                      Esc
                    </Box>
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search' },
            }}
            sx={{ '& fieldset': { border: 'none' }, borderBottom: 1, borderColor: 'divider' }}
          />
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {status === 'unavailable' && (
              <Typography sx={{ p: 3 }} color="text.secondary">
                The search index is not available. It is generated by <code>pnpm build</code>.
              </Typography>
            )}
            {status !== 'unavailable' && query !== '' && results.length === 0 && status === 'idle' && (
              <Typography sx={{ p: 3 }} color="text.secondary">
                No results for “{query}”.
              </Typography>
            )}
            <List disablePadding>
              {results.map((result, index) => (
                <ListItemButton
                  key={result.url}
                  selected={index === selected}
                  onClick={() => go(result.url)}
                  onMouseEnter={() => setSelected(index)}
                  sx={{ display: 'block', borderBottom: 1, borderColor: 'divider', py: 1.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 600 }}>{result.meta.title ?? toRelative(result.url)}</Typography>
                    {result.filters.section?.map((section) => (
                      <Chip key={section} label={section} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <Excerpt value={result.excerpt} />
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
