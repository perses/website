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
