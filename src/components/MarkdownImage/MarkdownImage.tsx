import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import { type ComponentProps, useState } from 'react';

/**
 * MarkdownImage displays an image of a markdown document. Clicking on it opens it in full size.
 */
export function MarkdownImage({ src, alt, width, height, title, align }: ComponentProps<'img'> & { align?: string }) {
  const float = align === 'left' || align === 'right' ? align : undefined;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Box
        component="img"
        src={src}
        alt={alt ?? ''}
        title={title}
        width={width}
        height={height}
        loading="lazy"
        onClick={() => setOpen(true)}
        sx={{
          maxWidth: '100%',
          height: 'auto',
          cursor: 'zoom-in',
          borderRadius: 1,
          verticalAlign: 'middle',
          ...(float && { float: { sm: float }, mr: { sm: float === 'left' ? 3 : 0 }, ml: { sm: float === 'right' ? 3 : 0 }, mb: 2 }),
        }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth={false} aria-label={alt ?? 'Image'}>
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
