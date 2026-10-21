import Box, { type BoxProps } from '@mui/material/Box';
import { useEffect, useRef } from 'react';

export interface LazyVideoProps extends Omit<BoxProps<'video'>, 'ref'> {
  src: string;
  title: string;
}

/**
 * LazyVideo is a muted video playing in loop, like an animated image. It is downloaded and played only when it is
 * visible, and paused when it leaves the screen. Clicking on it toggles the playback.
 */
export function LazyVideo({ src, title, sx, ...props }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (video === null) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      component="video"
      ref={ref}
      src={src}
      title={title}
      aria-label={title}
      muted
      loop
      playsInline
      preload="none"
      onClick={() => {
        const video = ref.current;
        if (video) {
          void (video.paused ? video.play() : Promise.resolve(video.pause()));
        }
      }}
      sx={{ display: 'block', width: '100%', cursor: 'pointer', ...sx }}
      {...props}
    />
  );
}
