import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  // The website is entirely static: every page is prerendered to HTML at build time, then hydrated in the browser.
  ssr: false,
  prerender: {
    concurrency: 8,
    paths: async () => {
      const { listAllPaths } = await import('./src/content/paths.server.ts');
      return listAllPaths();
    },
  },
  buildEnd: async ({ reactRouterConfig }) => {
    const { finalizeBuild } = await import('./src/content/build.server.ts');
    await finalizeBuild(`${reactRouterConfig.buildDirectory}/client`);
  },
} satisfies Config;
