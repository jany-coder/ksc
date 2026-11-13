// Tells search engines that "/gallery" (Bengali) and "/en/gallery" (English) are
// the same page in two languages. hreflang needs ABSOLUTE addresses, so it is
// off until the final domain is set at build time (VITE_SITE_URL, e.g.
// "https://kalmasocialclub.org", no trailing slash). Without it: no links.
const SITE = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(
  /\/+$/,
  '',
)

/** `path` is the Bengali path: "" for the home page, "/gallery", "/join". */
export function alternateLinks(path: string) {
  if (!SITE) return []
  return [
    { rel: 'alternate', hrefLang: 'bn', href: `${SITE}${path || '/'}` },
    { rel: 'alternate', hrefLang: 'en', href: `${SITE}/en${path}` },
    { rel: 'alternate', hrefLang: 'x-default', href: `${SITE}${path || '/'}` },
  ]
}
