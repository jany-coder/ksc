import { useRouter } from '@tanstack/react-router'

import { saveLang } from '../lib/i18n/saved-lang.ts'
import { useLang, useT } from '../lib/i18n/index.tsx'
import { cn } from '../lib/utils.ts'

/**
 * Language switch for the admin panel and the sign-in pages. They have no
 * "/en" in their URL: the choice is remembered in a cookie. After saving it the
 * router re-reads it (invalidate), so the page changes language without a full
 * reload. The public site uses LangSwitch (a link) instead.
 */
export function LangToggle({ className }: { className?: string }) {
  const lang = useLang()
  const t = useT()
  const router = useRouter()
  const other = lang === 'en' ? 'bn' : 'en'

  return (
    <button
      type="button"
      lang={other}
      aria-label={t('lang.switchLabel')}
      onClick={() => {
        saveLang(other)
        void router.invalidate()
      }}
      className={cn(
        'inline-flex min-h-8 items-center rounded-lg border border-border px-2.5 text-[13px] font-semibold text-zinc-700 hover:bg-secondary',
        className,
      )}
    >
      {t('lang.otherName')}
    </button>
  )
}
