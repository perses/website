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

import ArrowForward from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';
import { InlineText } from '../InlineText/InlineText';
import { LazyVideo } from '../LazyVideo/LazyVideo';

export interface Feature {
  title: string;
  description: string;
  media: string;
  learnMore?: string;
}

export interface FeatureSectionProps {
  feature: Feature;
  reverse?: boolean;
}

/**
 * FeatureSection presents a feature with a text and a screenshot or a video, side by side.
 */
export function FeatureSection({ feature, reverse = false }: FeatureSectionProps) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(feature.media);
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 3, md: 6 },
        alignItems: 'center',
        gridTemplateColumns: { xs: '1fr', md: reverse ? '3fr 2fr' : '2fr 3fr' },
      }}
    >
      <Box sx={{ order: { xs: 0, md: reverse ? 1 : 0 } }}>
        <Typography variant="h3" component="h3" gutterBottom>
          {feature.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          <InlineText text={feature.description} />
        </Typography>
        {feature.learnMore !== undefined && (
          <Button component={RouterLink} to={feature.learnMore} endIcon={<ArrowForward />} sx={{ px: 0 }}>
            Learn more
          </Button>
        )}
      </Box>
      <Box
        sx={{
          order: { xs: 1, md: reverse ? 0 : 1 },
          borderRadius: 2,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        {isVideo ? (
          <LazyVideo src={feature.media} title={feature.title} />
        ) : (
          <Box component="img" src={feature.media} alt={feature.title} loading="lazy" sx={{ display: 'block', width: '100%' }} />
        )}
      </Box>
    </Box>
  );
}
