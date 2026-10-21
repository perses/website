import createCache, { type Options } from '@emotion/cache';

/**
 * createEmotionCache creates the Emotion cache used by MUI. The styles are wrapped in a `mui` cascade layer so the
 * global styles of the website can override them without specificity issues.
 */
export function createEmotionCache(options?: Partial<Options>) {
  const cache = createCache({ key: 'mui', ...options });
  const insert = cache.insert;
  cache.insert = (...args) => {
    // Styles defining the layer order (`@layer ...` without block) must stay as is.
    if (!/^@layer\s[^{]*$/.test(args[1].styles)) {
      args[1].styles = `@layer mui {${args[1].styles}}`;
    }
    return insert(...args);
  };
  return cache;
}
