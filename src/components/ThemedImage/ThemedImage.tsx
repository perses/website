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
