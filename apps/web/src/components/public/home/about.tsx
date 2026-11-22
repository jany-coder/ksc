import { CircleCheck, Target } from 'lucide-react'

import { useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { cn } from '../../../lib/utils.ts'
import { SectionHeading } from '../section-heading.tsx'
import {
  bodyText,
  card,
  iconTile,
  liftCard,
  numberTile,
  tickItem,
} from '../styles.ts'

// "About us": the club's own text, word for word (the English is a draft for
// the club to approve).
const INTRO: MessageKey[] = ['about.p1', 'about.p2', 'about.p3', 'about.p4']

const GOALS: MessageKey[] = [
  'about.goal1',
  'about.goal2',
  'about.goal3',
  'about.goal4',
  'about.goal5',
  'about.goal6',
  'about.goal7',
  'about.goal8',
]

const PRINCIPLES: { title: MessageKey; text: MessageKey }[] = [
  { title: 'about.pr1Title', text: 'about.pr1Text' },
  { title: 'about.pr2Title', text: 'about.pr2Text' },
  { title: 'about.pr3Title', text: 'about.pr3Text' },
  { title: 'about.pr4Title', text: 'about.pr4Text' },
  { title: 'about.pr5Title', text: 'about.pr5Text' },
]

export function About() {
  const t = useT()
  const number = useNumber()
  return (
    <section
      id="about"
      className="scroll-mt-4 border-y border-line bg-panel py-14 md:scroll-mt-16 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <SectionHeading
              title={t('about.title')}
              subtitle={t('about.tagline')}
              className="mb-6 md:mb-8"
            />
            <div className="flex flex-col gap-5">
              {INTRO.map((key) => (
                <p key={key} className={bodyText}>
                  {t(key)}
                </p>
              ))}
            </div>
          </div>
          <div className={cn(card, 'min-w-0 self-start p-6 md:p-8')}>
            <div className="mb-5 flex items-center gap-3">
              <span className={iconTile}>
                <Target
                  className="size-6"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <h3 className="text-[21px] leading-snug font-semibold text-brand-deep md:text-[22px]">
                {t('about.goalsTitle')}
              </h3>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {GOALS.map((key) => (
                <li key={key} className={tickItem}>
                  <CircleCheck
                    aria-hidden="true"
                    className="mt-1 size-[18px] shrink-0 text-primary"
                    strokeWidth={2}
                  />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mt-14 mb-6 text-2xl font-bold text-brand-deep md:mt-20 md:mb-8 md:text-[32px]">
          {t('about.principlesTitle')}
        </h3>
        {/* Five principles with no empty slot: on wide screens three, then
            two wider ones filling the second row; in two columns, the last
            one spans both. */}
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.title}
              className={cn(
                liftCard,
                'flex flex-col p-6 md:p-7',
                i < 3 ? 'lg:col-span-2' : 'lg:col-span-3',
                i === PRINCIPLES.length - 1 && 'md:col-span-2',
              )}
            >
              <div className="mb-4 flex items-center gap-3">
                <span aria-hidden="true" className={numberTile}>
                  {number(i + 1)}
                </span>
                <h4 className="text-[20px] leading-snug font-semibold text-ink md:text-[21px]">
                  {t(p.title)}
                </h4>
              </div>
              <p className="text-base leading-[1.75] text-copy">{t(p.text)}</p>
            </li>
          ))}
        </ol>

        <div className="relative mt-14 overflow-hidden rounded-3xl bg-brand-deep px-6 py-10 text-center text-white md:mt-20 md:px-12 md:py-14">
          <h3 className="mb-4 text-2xl font-bold md:text-[32px]">
            {t('about.commitTitle')}
          </h3>
          <p className="mx-auto mb-4 max-w-[62ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('about.commit1')}
          </p>
          <p className="mx-auto mb-7 max-w-[62ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('about.commit2')}
          </p>
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 font-heading text-lg font-semibold text-mint md:text-2xl">
            {t('about.slogan')}
          </p>
        </div>
      </div>
    </section>
  )
}
