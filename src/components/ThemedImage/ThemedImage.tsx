import Box, { type BoxProps } from '@mui/material/Box';

export interface ThemedImageProps extends Omit<BoxProps<'img'>, 'src'> {
  light: string;
  dark?: string;
  alt: string;
}

/**
 * ThemedImage displays an image that has a light and a dark variant. Both images are rendered and the right one is
 * displayed with CSS, so the static HTML is correct before the JavaScript is loaded.
 */
export function ThemedImage({ light, dark, alt, className, ...props }: ThemedImageProps) {
  if (dark === undefined || dark === light) {
    return <Box component="img" src={light} alt={alt} className={className} {...props} />;
  }
  return (
    <>
      <Box component="img" src={light} alt={alt} className={['only-light', className].filter(Boolean).join(' ')} {...props} />
      <Box component="img" src={dark} alt={alt} className={['only-dark', className].filter(Boolean).join(' ')} {...props} />
    </>
  );
}
