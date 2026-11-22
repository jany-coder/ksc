import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

// The site's own address ("https://kalmasocialclub.workers.dev"), for links
// that must be absolute: the photo and page in a Facebook or WhatsApp preview.
// VITE_SITE_URL wins when set at build time; otherwise the address the page
// was asked for (on the server) or is open at (in the browser).
const configured = (
  import.meta.env.VITE_SITE_URL as string | undefined
)?.replace(/\/+$/, '')

export const getSiteOrigin = createIsomorphicFn()
  .server(() => configured || new URL(getRequest().url).origin)
  .client(() => configured || window.location.origin)
