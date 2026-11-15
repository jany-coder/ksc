import { BellOff } from 'lucide-react'

import { formatDate } from '../../../lib/datetime.ts'
import { useLang, useT } from '../../../lib/i18n/index.tsx'

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
          <h2 className="mb-3.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
            {t('notice.title')}
          </h2>
          <p className="text-[17px] leading-[1.65] text-copy md:text-[19px]">
            {t('notice.lead')}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex min-w-0 flex-[999_1_460px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#c9d8cf] bg-card px-6 py-12 text-center md:py-14">
            <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-accent">
              <BellOff
                className="size-7 text-primary"
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
          <ul className="m-0 flex min-w-0 flex-[999_1_460px] list-none flex-col border-t border-line p-0">
            {items.map((n) => (
              <li
                key={n.id}
                className="flex flex-wrap gap-5 border-b border-line py-[26px]"
              >
                <span className="flex-[0_0_96px] pt-[3px] text-[15px] text-subtle">
                  {n.publishedDate ? formatDate(n.publishedDate, lang) : ''}
                </span>
                <div className="min-w-0 flex-[999_1_240px]">
                  <h3 className="mb-1.5 flex flex-wrap items-center gap-2.5 text-xl font-semibold text-ink">
                    {n.urgent && (
                      <span className="rounded bg-[#fbe8e7] px-[9px] py-[3px] font-sans text-[13px] font-semibold text-[#9e2a23]">
                        {t('notice.urgent')}
                      </span>
                    )}
                    {n.title}
                  </h3>
                  <p className="text-base leading-[1.65] text-copy">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
