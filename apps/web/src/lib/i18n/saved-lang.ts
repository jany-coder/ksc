import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import { LANG_COOKIE, isLang, readLangFromCookieHeader } from './core.ts'
import type { Lang } from './core.ts'

// The language a person last chose, from a cookie. The same call works on the
// server (reads the request's cookie) and in the browser (reads document.cookie),
// so no network round trip is needed on a client-side page change.
// The cookie holds only "bn" or "en": nothing private, so JavaScript may read it.
export const getSavedLang = createIsomorphicFn()
  .server((): Lang | null => {
    const value = getCookie(LANG_COOKIE)
    return isLang(value) ? value : null
  })
  .client((): Lang | null => readLangFromCookieHeader(document.cookie))

/** Remember the choice for a year. Browser only. */
export function saveLang(lang: Lang): void {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`
}
