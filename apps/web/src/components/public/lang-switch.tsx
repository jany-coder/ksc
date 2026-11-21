import { useRouter, useRouterState } from '@tanstack/react-router'

import { switchLangPath } from '../../lib/i18n/core.ts'
import { saveLang } from '../../lib/i18n/saved-lang.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'

/**
 * Switches the same page to the other language. A real link, so it works
 * without JavaScript, opens in a new tab, and search engines can follow it.
 * A plain click, though, changes the page in place through the router: only
 * the texts change, the page keeps its place, and its data is reused (see
 * lib/public-data.ts). A full reload took a noticeable moment and jumped back
 * to the top.
 */
export function LangSwitch() {
  const lang = useLang()
  const t = useT()
  const router = useRouter()
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
      onClick={(event) => {
        saveLang(other)
        // Ctrl / Cmd / Shift / middle click: let the browser open it as asked.
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        void router.navigate({ href, resetScroll: false })
      }}
      className="inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-[15px] font-semibold text-brand-deep hover:bg-panel"
    >
      {t('lang.otherName')}
    </a>
  )
}
