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

import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Box, { type BoxProps } from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useEffect, useRef, useState } from 'react';

export interface LazyVideoProps extends Omit<BoxProps<'video'>, 'ref'> {
  src: string;
  title: string;
}

/**
 * LazyVideo is a muted video playing in loop, like an animated image. It is downloaded and played only when it is
 * visible, and paused when it leaves the screen. A button pauses it, and it doesn't start automatically when the
 * visitor prefers reduced motion.
 */
export function LazyVideo({ src, title, sx, ...props }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // Paused by the visitor, or not started because the visitor prefers reduced motion: don't play it automatically.
  const pausedByUser = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (video === null) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pausedByUser.current = true;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !pausedByUser.current) {
          void video.play().catch(() => undefined);
        } else if (!entry?.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const video = ref.current;
    if (video === null) {
      return;
    }
    if (video.paused) {
      pausedByUser.current = false;
      void video.play().catch(() => undefined);
    } else {
      pausedByUser.current = true;
      video.pause();
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="video"
        ref={ref}
        src={src}
        title={title}
        aria-label={title}
        muted
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        sx={{ display: 'block', width: '100%', cursor: 'pointer', ...sx }}
        {...props}
      />
      <IconButton
        onClick={toggle}
        aria-label={playing ? `Pause the video: ${title}` : `Play the video: ${title}`}
        size="small"
        sx={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          color: 'common.white',
          bgcolor: 'rgba(0, 0, 0, 0.55)',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.75)' },
        }}
      >
        {playing ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
      </IconButton>
    </Box>
  );
}
