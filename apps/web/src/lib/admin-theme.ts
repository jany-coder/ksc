import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

// The admin panel's light / dark choice. Kept in a cookie (like the language,
// see i18n/saved-lang.ts) so the server already renders the right theme: no
// white flash before the page turns dark. The cookie holds only the word.
export const ADMIN_THEMES = ['light', 'dark', 'system'] as const
export type AdminTheme = (typeof ADMIN_THEMES)[number]

export const THEME_COOKIE = 'ksc_admin_theme'

export function isAdminTheme(value: unknown): value is AdminTheme {
  return ADMIN_THEMES.includes(value as AdminTheme)
}

export function readThemeFromCookieHeader(header: string): AdminTheme | null {
  for (const part of header.split(';')) {
    const [name, value] = part.trim().split('=')
    if (name === THEME_COOKIE && isAdminTheme(value)) return value
  }
  return null
}

/**
 * The class for <html>. Only admin pages get a theme: the public site and the
 * sign-in pages always stay light. Light is the default.
 */
export function themeClass(
  pathname: string,
  theme: AdminTheme | null,
): string | undefined {
  if (!(pathname === '/admin' || pathname.startsWith('/admin/'))) return
  if (theme === 'dark') return 'dark'
  if (theme === 'system') return 'theme-auto' // follows the device setting
  return undefined
}

export const getSavedTheme = createIsomorphicFn()
  .server((): AdminTheme | null => {
    const value = getCookie(THEME_COOKIE)
    return isAdminTheme(value) ? value : null
  })
  .client((): AdminTheme | null => readThemeFromCookieHeader(document.cookie))

/** Remember the choice for a year. Browser only. */
export function saveTheme(theme: AdminTheme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`
}
