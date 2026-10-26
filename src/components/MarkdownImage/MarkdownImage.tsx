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
import Dialog from '@mui/material/Dialog';
import { type ComponentProps, useState } from 'react';

type MarkdownImageProps = ComponentProps<'img'> & { align?: string; 'data-in-link'?: string };

/**
 * MarkdownImage displays an image of a markdown document. The image is a button opening it in full size, except when
 * it is inside a link.
 */
export function MarkdownImage({ src, alt, width, height, title, align, 'data-in-link': inLink }: MarkdownImageProps) {
  const [open, setOpen] = useState(false);
  const float = align === 'left' || align === 'right' ? align : undefined;
  const image = (
    <Box
      component="img"
      src={src}
      alt={alt ?? ''}
      title={title}
      width={width}
      height={height}
      loading="lazy"
      sx={{ maxWidth: '100%', height: 'auto', borderRadius: 1, verticalAlign: 'middle', display: 'inline-block' }}
    />
  );
  const floatStyles = float && {
    float: { sm: float },
    mr: { sm: float === 'left' ? 3 : 0 },
    ml: { sm: float === 'right' ? 3 : 0 },
    mb: 2,
  };
  if (inLink !== undefined) {
    return <Box component="span" sx={{ display: 'inline-block', maxWidth: '100%', ...floatStyles }}>{image}</Box>;
  }
  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title={alt ? `Enlarge: ${alt}` : 'Enlarge the image'}
        sx={{
          display: 'inline-block',
          maxWidth: '100%',
          p: 0,
          border: 0,
          background: 'none',
          cursor: 'zoom-in',
          verticalAlign: 'middle',
          borderRadius: 1,
          '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
          ...floatStyles,
        }}
      >
        {image}
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth={false} aria-label={alt || 'Image'}>
        <Box
          component="img"
          src={src}
          alt={alt ?? ''}
          onClick={() => setOpen(false)}
          sx={{ display: 'block', maxWidth: '90vw', maxHeight: '90vh', cursor: 'zoom-out' }}
        />
      </Dialog>
    </>
  );
}
