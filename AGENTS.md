# AI contributor guide

## Purpose and instruction scope

This repository contains the website [perses.dev](https://perses.dev) and the infrastructure of the Perses demo
([demo.perses.dev](https://demo.perses.dev)).

The website is fully static: React 19, React Router 8 in framework mode (`ssr: false` with `prerender`, every page is
rendered to HTML at build time then hydrated), Vite, Material UI with Emotion, TypeScript, Vitest, Oxlint, pnpm and
Node.js 24. There is no server at runtime: nginx serves the files of `build/client`.

Before editing, read `README.md` for the local setup, the organization of the content and the deployment. Commits need a
[DCO sign-off](https://github.com/probot/dco#how-it-works) (`git commit -s`).

## Architecture map

- `website.yaml`: main configuration (top menu, documentation sources and their versioning, footer, download pages).
  Its schema is in `src/content/config.server.ts`.
- `content/`: the content written in this repository.
  - `blog/posts/`: blog posts, markdown with a front matter (`date`, `categories`, optional `slug`, `authors`,
    `draft`). The URL of a post is `/blog/YYYY/MM/DD/<slug>/`: never change the slug of a published post.
  - `pages/`: other markdown pages (adopters).
  - `adopters.yaml`: companies displayed on the home page and the adopters page.
  - `nav/<source>/<version>.yaml`: fallback navigation of the documentation versions that don't provide their own
    `docs/nav.yaml`.
- `public/`: static files served as is (images, videos, favicon).
- `src/routes.ts`, `src/root.tsx`, `src/entry.server.tsx`, `src/entry.client.tsx`: routes, document layout and theme
  providers, prerendering with the extraction of the critical CSS, hydration.
- `src/pages/<Page>/`: one folder per route component, with its `loader` and `meta`.
- `src/components/<Component>/`: one folder per component, with its tests.
- `src/resources/`: resource routes generating non-HTML files (RSS and JSON feeds, sitemap).
- `src/content/*.server.ts`: build-time code running in Node.js only (documentation sync, version resolution, markdown
  pipeline, navigation, blog, feeds, downloads, prerender paths, search index). The `.server` suffix keeps it out of the
  browser bundles.
- `src/content/markdown/`: unified pipeline (GFM, mkdocs and GitHub admonitions, heading ids compatible with
  python-markdown, Shiki highlighting with light and dark themes, mermaid, URL rewriting). It produces a HAST tree
  rendered with React components by `src/components/Markdown`.
- `src/utils/`: code shared by the build and the browser (URLs, slugs, search scopes, releases, platform detection).
- `src/theme/`: Material UI theme, colors of the Perses design system, Emotion cache, global CSS.
- `scripts/sync-content.ts`: synchronizes the documentation sources and the releases into `.cache/` (git ignored).
- `nginx/website.conf`, `docker-compose.yaml`, `Makefile` (`deploy-website`): deployment.
- `scripts/check-license/`: license header check (`make checklicense`), using the package shared by the Perses
  repositories (`github.com/perses/perses/scripts/pkg/license`).
- Demo only, not part of the website: `dac/` (Dashboard-as-Code of the demo dashboards), `provisioning/`,
  `perses.yaml`, `prometheus.yml`, `scripts/generate_config.sh`, the other services of `docker-compose.yaml`.

The documentation is not written here. It is pulled at build time from perses/perses, perses/perses-operator,
perses/helm-charts, perses/plugins and perses/metrics-usage (`docs/` of each repository). Versioned sources publish
every minor version from its release branch `release/vX.Y`, or its latest patch tag. Fix the content of the
documentation in its repository, and the navigation in the `docs/nav.yaml` of that repository; `content/nav/` is only a
fallback for old versions.

## Engineering rules

- Prefer the smallest coherent change. Do not combine a feature with unrelated refactoring or dependency upgrades.
- The website must stay static: data comes from loaders running at build time. Code needing Node.js APIs belongs in a
  `*.server.ts` module, used by route modules in their `loader` only: `meta` and the components also run in the
  browser.
- Build-time modules import each other with explicit `.ts` extensions, so `scripts/sync-content.ts` runs with the type
  stripping of Node.js (`node scripts/sync-content.ts`), without bundler.
- Keep the URLs stable. The URLs of the previous mkdocs website (`/perses/docs/...`, `/plugins/docs/...`, blog posts,
  `/feed_rss_created.xml`...) are redirected or still served: check `src/content/legacy.server.ts`, the catch-all route
  and the rewrites of `nginx/website.conf` (they must stay aligned with the `legacyPath` of `website.yaml`) before
  changing a route, a slug or the heading id algorithm.
- Every page with a loader must be listed in the prerender paths (`src/content/paths.server.ts`), otherwise the build
  fails or the page is missing from the output. Redirects use `throw redirect(url, 301)` in the loader.
- Only the elements with `data-pagefind-body` are indexed by the search. Redirect pages and the duplicated pages of an
  explicit latest version (`vX.Y` when it is also `latest`) must not be indexed. Keep the `scope`/`source`/`section`
  filters consistent with `src/utils/search.ts`.
- The markdown of the documentation must keep rendering correctly on GitHub: support new syntaxes in the pipeline
  rather than asking the other repositories for website-specific markup.
- Support both color schemes. Use the theme palette instead of hard-coded colors, and `ThemedImage` for images with a
  light and a dark variant. Prerendered HTML must not depend on the browser (theme, platform, storage): read browser
  state in effects to avoid hydration mismatches.
- Keep the UI accessible: native interactive elements (`button`, `a`), accessible names, keyboard support, focus
  management in dialogs, `prefers-reduced-motion` for animations.
- Browser requests to third-party APIs (GitHub releases) must be optional: cache them, handle rate limits, and fall
  back to the data of the build.
- New source files (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.go`, `*.cue`) need the Apache license header of the Perses
  project, without date (`// Copyright The Perses Authors`). `make fixlicense` adds it where it is missing.
- Do not add dependencies or a new architectural pattern without a clear need. Import Material UI components from their
  own path (`@mui/material/Button`), not from the barrel.
- Do not raise lint ceilings or add broad suppressions. New code must not add Oxlint warnings.
- Keep `README.md` and the comments of `website.yaml` accurate when commands, configuration or behavior change.

## Validation

Use Node.js from `.nvmrc` and pnpm from `packageManager` in `package.json` (`corepack enable pnpm`).

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

While iterating, run a focused test (`pnpm exec vitest run src/content/blog.server.test.ts`) and the website with live
reload (`pnpm start`, http://localhost:3000). To work on the documentation of another repository:
`WEBSITE_LOCAL_SOURCES="perses=../perses" pnpm start`. The search is only available after `pnpm build`
(`pnpm preview`, http://localhost:4173).

`pnpm build` fetches the documentation and the GitHub releases: set `GITHUB_TOKEN` to avoid the rate limit of the GitHub
API. Check its output for warnings about broken links or pages missing from a navigation.

Check the license headers (requires Go, see `go.mod`):

```sh
make checklicense
```

For changes to `nginx/website.conf`, validate the configuration:

```sh
docker run --rm -v "$PWD/nginx/website.conf:/etc/nginx/conf.d/default.conf:ro" nginx nginx -t
```

For changes to YAML files, the CI also runs `yamllint .`.

## Completion checklist

- The change is in the right place: website code here, documentation content and `docs/nav.yaml` in their repository.
- Existing URLs, slugs and heading anchors still resolve, or are redirected.
- New behavior and important failures are covered by focused tests, colocated with the code.
- The pages render without hydration errors in both color schemes, and new interactive elements work with the
  keyboard.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `make checklicense` pass.
- The final diff contains no build output (`build/`, `.cache/`), credentials or unrelated edits.
