import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

import { DEFAULT_LANG, formatNumber, makeT } from './core.ts'
import type { Lang } from './core.ts'
import { MIN_PASSWORD_LENGTH } from '../password-rules.ts'
import { isMessageKey, messages } from './messages.ts'

const LangContext = createContext<Lang>(DEFAULT_LANG)

export function LangProvider({
  lang,
  children,
}: {
  lang: Lang
  children: ReactNode
}) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useLang(): Lang {
  return useContext(LangContext)
}

/** `const t = useT()` then `t('nav.home')` or `t('key', { n: 3 })`. */
export function useT() {
  const lang = useLang()
  return useMemo(() => makeT(messages, lang), [lang])
}

/** Numbers in the reader's digits: ২০২৬ or 2026. */
export function useNumber() {
  const lang = useLang()
  return (value: number) => formatNumber(value, lang)
}

/**
 * Path params for links to public pages. English adds the "/en" prefix, Bengali
 * leaves it off (route "/{-$locale}/..."), so a link keeps the reader's language.
 *   <Link to="/{-$locale}/gallery" params={useLocaleParams()} />
 */
export function useLocaleParams(): { locale: string | undefined } {
  return { locale: useLang() === 'en' ? 'en' : undefined }
}

/**
 * Show a form error in the reader's language. Schemas carry message KEYS; a key
 * is translated, anything else (e.g. a message from a library) is shown as is.
 */
export function useTMessage() {
  const t = useT()
  return (message: string | undefined): string | undefined => {
    if (message === undefined) return undefined
    return isMessageKey(message)
      ? t(message, { min: MIN_PASSWORD_LENGTH })
      : message
  }
}
