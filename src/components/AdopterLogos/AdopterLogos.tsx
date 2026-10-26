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

import Box from '@mui/material/Box';
import type { Adopter } from '../../content/types';
import { ThemedImage } from '../ThemedImage/ThemedImage';

export function AdopterLogos({ adopters }: { adopters: Adopter[] }) {
  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
      }}
    >
      {adopters.map((adopter) => (
        <Box component="li" key={adopter.name}>
          <Box
            component="a"
            href={adopter.url}
            target="_blank"
            rel="noopener noreferrer"
            title={adopter.name}
            sx={{
              height: 96,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <ThemedImage
              light={adopter.logo.light}
              dark={adopter.logo.dark}
              alt={`${adopter.name} logo`}
              loading="lazy"
              sx={{ maxWidth: '100%', maxHeight: 56, objectFit: 'contain' }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
