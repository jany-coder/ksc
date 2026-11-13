// The language machinery, with no React and no messages in it, so the server,
// the browser and the tests can all use it.
export const LANGS = ['bn', 'en'] as const
export type Lang = (typeof LANGS)[number]

// Bengali is the default (CLAUDE.md section 1). On the public site the URL
// decides: "/gallery" is Bengali, "/en/gallery" is English.
export const DEFAULT_LANG: Lang = 'bn'
export const LANG_COOKIE = 'ksc_lang'

export function isLang(value: unknown): value is Lang {
  return value === 'bn' || value === 'en'
}

/** A message in every language. Both are required, so none can be forgotten. */
export type Entry = { bn: string; en: string }

/** "Hello {name}" + { name: 'Rahim' } -> "Hello Rahim". */
export function fill(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  )
}

// Public pages are chosen by URL; the rest (admin, login) follow the saved choice.
const PRIVATE_PREFIXES = ['/admin', '/login', '/change-password', '/api']

export function isPublicPath(pathname: string): boolean {
  return !PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/')
}

/**
 * Which language a page is in.
 *  - /en/... is English;
 *  - any other PUBLIC page is Bengali (the URL decides, so a shared link looks
 *    the same to everyone);
 *  - admin and login pages use the language the person last chose (a cookie).
 */
export function resolveLang(pathname: string, saved: Lang | null): Lang {
  if (isEnglishPath(pathname)) return 'en'
  if (isPublicPath(pathname)) return DEFAULT_LANG
  return saved ?? DEFAULT_LANG
}

/** The same page in the other language. Query string and #hash are kept. */
export function switchLangPath(pathname: string, to: Lang): string {
  const bare = isEnglishPath(pathname) ? pathname.slice(3) || '/' : pathname
  return to === 'en' ? (bare === '/' ? '/en' : `/en${bare}`) : bare
}

export function readLangFromCookieHeader(header: string | null): Lang | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === LANG_COOKIE) {
      const value = rest.join('=')
      return isLang(value) ? value : null
    }
  }
  return null
}

/** Build a translate function for one language from a table of messages. */
export function makeT<TMessages extends Record<string, Entry>>(
  messages: TMessages,
  lang: Lang,
) {
  return (
    key: keyof TMessages & string,
    params?: Record<string, string | number>,
  ) => fill(messages[key]![lang], params)
}

/** 2026 -> "২০২৬" in Bengali, "2026" in English. No thousands separators. */
export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    useGrouping: false,
  }).format(value)
}
