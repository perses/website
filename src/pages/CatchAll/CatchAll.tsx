import { NotFound } from '../../components/NotFound/NotFound';
import { Redirect, redirectMeta } from '../../components/Redirect/Redirect';
import { mapLegacyPath } from '../../content/legacy.server';
import type { Route } from './+types/CatchAll';

/**
 * The catch-all route redirects the URLs of the previous website to the new ones, and renders the "not found" page
 * for the other URLs. The page `/404/` is prerendered and served by the web server for the unknown URLs.
 */
export function loader({ url }: Route.LoaderArgs) {
  // `url` is the URL of the page, while `request.url` is the URL of the data request (`.../_.data`).
  const { pathname } = url;
  if (pathname.startsWith('/blog/archive/')) {
    return { to: '/blog/' };
  }
  const to = mapLegacyPath(pathname);
  return to === undefined ? { to: undefined } : { to };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (loaderData?.to !== undefined) {
    return redirectMeta(loaderData.to);
  }
  return [{ title: 'Page not found | Perses' }, { name: 'robots', content: 'noindex' }];
}

export default function CatchAll({ loaderData }: Route.ComponentProps) {
  return loaderData.to === undefined ? <NotFound /> : <Redirect to={loaderData.to} />;
}
