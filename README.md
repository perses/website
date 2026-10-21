# website

This repository contains everything required to start the Perses demo and the website [perses.dev](https://perses.dev).

## Instructions

On the machine, in case you are doing a maintenance and at some point you will shut down all containers, you can't just
run `podman-compose up -d`.
That's because when you will kill the ssh connection, all containers will be stopped because it will send a signal
SIGHUP that will stop all processes in the current session.

Instead you will have to run the following command:

```bash
nohup podman-compose up &
```

In case you just want to restart a container. You can do the following command:

```bash
podman-compose down <container_name>
podman-compose up -d <container_name>
```

No need to use `nohup` in this case, as the podman-compose is still running in the background.
The process is killed if you are shutting down all containers.

### Restart the demo

In case you need to restart the demo server after a config change:

1. build the new config:

```bash
sh scripts/generate_config.sh
```

2. restart the demo server:

```bash
podman-compose down demo
# wait a bit, otherwise the old instance could still be running and you'd get an "address already in use" error
podman-compose up -d demo
```

## Website

The website [perses.dev](https://perses.dev) is a static website built with React, React Router (prerendering),
Material UI and Vite. Every page is prerendered to HTML at build time, then hydrated in the browser.

It contains:

- the home page, the adopters page and the blog, written in this repository (`content/`),
- the documentation of [perses/perses](https://github.com/perses/perses),
  [perses/perses-operator](https://github.com/perses/perses-operator),
  [perses/helm-charts](https://github.com/perses/helm-charts) and [perses/plugins](https://github.com/perses/plugins),
  pulled from these repositories at build time. Perses and the operator are versioned: every minor version is
  published (from the release branch when it exists, the latest patch tag otherwise),
- the download pages, built from the latest GitHub releases. In the browser, the pages also check GitHub for the
  releases published since the build and display them (cached 10 minutes; if GitHub is not reachable or rate limits
  the visitor, the releases of the build are displayed).

### Start the website locally

Requirements: Node.js 24 (see `.nvmrc`, `nvm use`) and pnpm (`corepack enable pnpm`).

```bash
pnpm install
pnpm start # or pnpm dev, http://localhost:3000
```

The changes are visible in real time: the code is hot reloaded, and the page reloads automatically when the content
changes (`content/`, `website.yaml` or a local clone of a documentation source, see below).

`pnpm start` first synchronizes the documentation (`pnpm content:sync`). The content is stored in `.cache/` and only
the versions that changed are downloaded again. The search is only available after a build (see below).

To work on the documentation of another repository and see the result live, point the source to your local clone:

```bash
WEBSITE_LOCAL_SOURCES="perses=../perses,plugins=../plugins" pnpm dev
```

For a versioned source, the local clone replaces the latest version.

### Build the website

```bash
pnpm build   # output in build/client
pnpm preview # serve the build on http://localhost:4173
```

The build synchronizes the content, prerenders every page, copies the images of the documentation and generates the
search index with [Pagefind](https://pagefind.app). Set `GITHUB_TOKEN` to avoid the rate limit of the GitHub API when
fetching the releases.

Other commands: `pnpm lint` (oxlint), `pnpm typecheck`, `pnpm test` (vitest).

### Organization of the website

- `website.yaml`: the main configuration: top menu, documentation sources and how they are versioned, footer,
  download pages.
- `content/blog/posts/`: the blog posts. A post is a markdown file with a front matter:

  ```markdown
  ---
  date: 2026-10-21
  categories:
    - Release notes
  # optional: authors, description, slug (defaults to the slugified title), draft
  ---

  # Title of the post

  Introduction displayed in the list of posts.

  <!-- more -->

  Rest of the post.
  ```

  Images go in `public/assets/images/blog/`. An RSS feed is generated for the blog (`/blog/rss.xml`) and for every
  category (`/blog/category/<category>/rss.xml`).
- `content/adopters.yaml`: the companies displayed on the home page and on the adopters page.
- `content/nav/`: the navigation of the documentation versions that don't provide their own `docs/nav.yaml`
  (see the comments in `website.yaml`).
- `public/`: static files (images, videos).
- `src/`: the code. `src/pages/` contains one folder per page, `src/components/` one folder per component and
  `src/content/` the code loading the content at build time.

### Documentation navigation

The navigation of a documentation source is described by a `docs/nav.yaml` file in its repository, so it evolves with
the documentation and each version has its own navigation. The syntax is close to the `nav` section of mkdocs:

```yaml
- overview.md                          # page, the title is the first h1 of the page
- Getting started: getting-started.md  # page with an explicit title
- Concepts:                            # section
    - Dashboard: concepts/dashboard.md
- Helm: helm-charts:installation.md    # page of another documentation source
- Demo: https://demo.perses.dev        # external link
```

The documentation is written in markdown (GitHub flavored). Both admonition syntaxes are supported: mkdocs
(`!!! note "Title"` followed by an indented block) and GitHub (`> [!NOTE]`). Mermaid diagrams are supported too.

### Deploy the website

To build the website and publish it in the folder `site/` served by nginx, run:

```bash
make deploy-website
```

The website stays available during the build: the new version is copied in `site/` at the end. The first time, start
the container serving it:

```bash
podman-compose up -d website
```

The website is served by nginx (configuration in `nginx/website.conf`) and is available at the url http://localhost:1313
