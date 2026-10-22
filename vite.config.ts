import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { contentPlugin } from './src/content/vite-plugin.server.ts';

export default defineConfig({
  plugins: [contentPlugin(), reactRouter()],
  ssr: {
    // Without this, the React context of MUI/Emotion is duplicated between the direct and transitive imports in dev.
    // See https://github.com/mui/material-ui/issues/45878#issuecomment-2987441663
    optimizeDeps: {
      include: ['@emotion/*', '@mui/*'],
    },
    noExternal: ['@emotion/*', '@mui/*'],
  },
  server: {
    port: 3000,
  },
});
