import { redirect } from 'react-router';
import { NotFound } from '../../components/NotFound/NotFound';
import { finalDocsUrl } from '../../content/docs.server';
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
    throw redirect('/blog/', 301);
  }
  const to = mapLegacyPath(pathname);
  if (to !== undefined) {
    throw redirect(finalDocsUrl(to), 301);
  }
  return { notFound: true };
}

export function meta() {
  return [{ title: 'Page not found | Perses' }, { name: 'robots', content: 'noindex' }];
}

export default function CatchAll() {
  return <NotFound />;
}
