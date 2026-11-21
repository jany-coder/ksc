import { BellOff, CalendarDays, Megaphone } from 'lucide-react'

import { formatDate } from '../../../lib/datetime.ts'
import { useLang, useT } from '../../../lib/i18n/index.tsx'
import { cn } from '../../../lib/utils.ts'
import { SectionHeading } from '../section-heading.tsx'
import { bloodTile, card, iconTile, pill } from '../styles.ts'

// "Notice board": the club's published notices. With none, a calm "no notices
// right now" panel instead: never made-up notices, since a fake blood request
// on a public site could cause real harm.
export type Notice = {
  id: string
  title: string
  body: string
  // "YYYY-MM-DD" (Dhaka day), formatted here in the reader's language.
  publishedDate: string | null
  urgent?: boolean
}

export function NoticeBoard({ items = [] }: { items?: Notice[] }) {
  const t = useT()
  const lang = useLang()

  return (
    <section
      id="notice"
      className="scroll-mt-4 md:scroll-mt-16 border-y border-line bg-accent py-14 md:py-[92px]"
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap gap-14 px-5 md:px-8">
        <div className="min-w-0 flex-[1_1_280px]">
          <SectionHeading title={t('notice.title')} className="mb-4 md:mb-5" />
          <p className="text-[17px] leading-[1.65] text-copy md:text-[19px]">
            {t('notice.lead')}
          </p>
        </div>

        {items.length === 0 ? (
          <div
            className={cn(
              card,
              'flex min-w-0 flex-[999_1_460px] flex-col items-center justify-center px-6 py-12 text-center md:py-14',
            )}
          >
            <span className={cn(iconTile, 'mb-4 size-14')}>
              <BellOff
                className="size-7"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>
            <h3 className="mb-2 text-[22px] font-semibold text-ink">
              {t('notice.emptyTitle')}
            </h3>
            <p className="mb-5 max-w-[46ch] text-base leading-[1.7] text-copy">
              {t('notice.emptyText')}
            </p>
            <a
              href="https://www.facebook.com/profile.php?id=100068969464914"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t('notice.emptyFacebook')}
            </a>
          </div>
        ) : (
          <ul className="m-0 flex min-w-0 flex-[999_1_460px] list-none flex-col gap-4 p-0">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  card,
                  'flex gap-4 p-5 md:p-6',
                  // An urgent notice gets a red edge so it is seen first.
                  n.urgent && 'border-s-4 border-s-blood',
                )}
              >
                <span
                  className={cn(
                    n.urgent ? bloodTile : iconTile,
                    'hidden sm:inline-flex',
                  )}
                >
                  <Megaphone
                    aria-hidden="true"
                    className="size-6"
                    strokeWidth={1.8}
                  />
                </span>
                <div className="min-w-0 grow">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {n.publishedDate && (
                      <span className={pill}>
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        {formatDate(n.publishedDate, lang)}
                      </span>
                    )}
                    {n.urgent && (
                      <span className="rounded-full bg-[#fbe8e7] px-3 py-1 font-sans text-[13px] font-semibold text-[#9e2a23]">
                        {t('notice.urgent')}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1.5 text-xl leading-snug font-semibold text-ink">
                    {n.title}
                  </h3>
                  <p className="text-base leading-[1.7] whitespace-pre-line text-copy">
                    {n.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
