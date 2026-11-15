import { HeartHandshake } from 'lucide-react'

import { useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// "Our activities": what the club has already done, as the club tells it.
// The live "upcoming activities" from the database follow in their own section.
type Entry = { date: MessageKey; title: MessageKey; text: MessageKey }

const YEAR_2025: Entry[] = [
  {
    date: 'activities.a1Date',
    title: 'activities.a1Title',
    text: 'activities.a1Text',
  },
  {
    date: 'activities.a2Date',
    title: 'activities.a2Title',
    text: 'activities.a2Text',
  },
  {
    date: 'activities.a3Date',
    title: 'activities.a3Title',
    text: 'activities.a3Text',
  },
  {
    date: 'activities.a4Date',
    title: 'activities.a4Title',
    text: 'activities.a4Text',
  },
  {
    date: 'activities.a5Date',
    title: 'activities.a5Title',
    text: 'activities.a5Text',
  },
  {
    date: 'activities.a6Date',
    title: 'activities.a6Title',
    text: 'activities.a6Text',
  },
]

const YEAR_2026: Entry[] = [
  {
    date: 'activities.b1Date',
    title: 'activities.b1Title',
    text: 'activities.b1Text',
  },
  {
    date: 'activities.b2Date',
    title: 'activities.b2Title',
    text: 'activities.b2Text',
  },
  {
    date: 'activities.b3Date',
    title: 'activities.b3Title',
    text: 'activities.b3Text',
  },
]

const STORIES: Entry[] = [
  {
    date: 'humanitarian.s1Date',
    title: 'humanitarian.s1Title',
    text: 'humanitarian.s1Text',
  },
  {
    date: 'humanitarian.s2Date',
    title: 'humanitarian.s2Title',
    text: 'humanitarian.s2Text',
  },
]

function Timeline({ heading, items }: { heading: MessageKey; items: Entry[] }) {
  const t = useT()
  return (
    <div className="mb-12 last:mb-0">
      <h3 className="mb-6 text-2xl font-bold text-brand-deep md:text-[30px]">
        {t(heading)}
      </h3>
      <ol className="m-0 list-none border-l-2 border-line p-0 pl-6 md:pl-8">
        {items.map((item) => (
          <li key={item.title} className="relative mb-8 last:mb-0">
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[31px] size-3 rounded-full bg-primary ring-4 ring-background md:-left-[39px]"
            />
            <span className="mb-2 inline-block rounded-[5px] bg-[#e3f0e9] px-[11px] py-[5px] text-sm font-semibold text-brand-deep">
              {t(item.date)}
            </span>
            <h4 className="mb-2 text-[21px] font-semibold text-ink md:text-[23px]">
              {t(item.title)}
            </h4>
            <p className="max-w-[68ch] text-[17px] leading-[1.75] text-copy">
              {t(item.text)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Activities() {
  const t = useT()
  return (
    <section
      id="activities"
      className="scroll-mt-4 md:scroll-mt-16 py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-2 text-[28px] font-bold text-brand-deep md:text-[40px]">
          {t('activities.title')}
        </h2>
        <p className="mb-6 font-heading text-lg font-semibold text-primary md:text-xl">
          {t('activities.subtitle')}
        </p>
        <p className="mb-4 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]">
          {t('activities.p1')}
        </p>
        <p className="mb-12 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:mb-14 md:text-[19px]">
          {t('activities.p2')}
        </p>

        <Timeline heading="activities.year2025" items={YEAR_2025} />
        <Timeline heading="activities.year2026" items={YEAR_2026} />

        <div className="mt-14 rounded-[10px] border border-line bg-card px-6 py-8 md:mt-20 md:px-10 md:py-10">
          <div className="mb-3 flex items-center gap-3">
            <HeartHandshake
              className="size-8 text-blood"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <h3 className="text-2xl font-bold text-brand-deep md:text-[30px]">
              {t('humanitarian.title')}
            </h3>
          </div>
          <p className="mb-7 max-w-[68ch] text-[17px] leading-[1.8] text-copy">
            {t('humanitarian.lead')}
          </p>

          <h4 className="mb-2 text-[21px] font-semibold text-ink md:text-[23px]">
            {t('humanitarian.bloodTitle')}
          </h4>
          <p className="mb-8 max-w-[68ch] text-[17px] leading-[1.75] text-copy">
            {t('humanitarian.bloodText')}
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
            {STORIES.map((s) => (
              <article
                key={s.title}
                className="rounded-[10px] border border-line bg-panel px-6 py-6"
              >
                <span className="mb-2 inline-block rounded-[5px] bg-[#e3f0e9] px-[11px] py-[5px] text-sm font-semibold text-brand-deep">
                  {t(s.date)}
                </span>
                <h4 className="mb-2 text-[21px] font-semibold text-ink">
                  {t(s.title)}
                </h4>
                <p className="text-base leading-[1.75] text-copy">
                  {t(s.text)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 border-t border-line pt-7">
            <h4 className="mb-2 text-[21px] font-semibold text-brand-deep">
              {t('humanitarian.beliefTitle')}
            </h4>
            <p className="mb-3 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800">
              {t('humanitarian.belief1')}
            </p>
            <p className="max-w-[68ch] text-[17px] leading-[1.8] font-semibold text-brand-deep">
              {t('humanitarian.belief2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
