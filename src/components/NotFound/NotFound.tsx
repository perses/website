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
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

export function NotFound() {
  return (
    <Box sx={{ py: 12, px: 2, textAlign: 'center' }}>
      <Typography variant="h1" gutterBottom>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for does not exist or has been moved. Try the search, or start from one of these pages.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
        <Button variant="contained" component={RouterLink} to="/">
          Home
        </Button>
        <Button variant="outlined" component={RouterLink} to="/docs/">
          Documentation
        </Button>
        <Button variant="outlined" component={RouterLink} to="/blog/">
          Blog
        </Button>
      </Stack>
    </Box>
  );
}
