import { useRouterState } from '@tanstack/react-router'

import { switchLangPath } from '../../lib/i18n/core.ts'
import { saveLang } from '../../lib/i18n/saved-lang.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'

/**
 * Switches the same page to the other language. A plain link (full page load),
 * so it works without JavaScript and search engines can follow it.
 */
export function LangSwitch() {
  const lang = useLang()
  const t = useT()
  const { pathname, searchStr, hash } = useRouterState({
    select: (s) => s.location,
  })
  const other = lang === 'en' ? 'bn' : 'en'
  const href = `${switchLangPath(pathname, other)}${searchStr}${hash ? `#${hash}` : ''}`

  return (
    <a
      href={href}
      lang={other}
      hrefLang={other}
      aria-label={t('lang.switchLabel')}
      onClick={() => saveLang(other)}
      className="inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-[15px] font-semibold text-brand-deep hover:bg-panel"
    >
      {t('lang.otherName')}
    </a>
  )
}
