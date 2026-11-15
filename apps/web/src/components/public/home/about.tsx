import { useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

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
      className="scroll-mt-4 md:scroll-mt-16 border-y border-line bg-panel py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <div className="flex flex-wrap gap-12 md:gap-16">
          <div className="min-w-0 flex-[999_1_420px]">
            <h2 className="mb-2 text-[28px] font-bold text-brand-deep md:text-[40px]">
              {t('about.title')}
            </h2>
            <p className="mb-6 font-heading text-lg font-semibold text-primary md:text-xl">
              {t('about.tagline')}
            </p>
            {INTRO.map((key) => (
              <p
                key={key}
                className="mb-5 max-w-[64ch] text-[17px] leading-[1.8] text-zinc-800 last:mb-0 md:text-[19px]"
              >
                {t(key)}
              </p>
            ))}
          </div>
          <div className="min-w-0 flex-[1_1_340px] rounded-[10px] border border-line bg-card px-6 py-7 md:px-8">
            <h3 className="mb-4 text-[22px] font-semibold text-brand-deep">
              {t('about.goalsTitle')}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {GOALS.map((key) => (
                <li
                  key={key}
                  className="relative pl-5 text-base leading-[1.65] text-copy before:absolute before:top-[0.7em] before:left-0 before:size-2 before:-translate-y-1/2 before:rounded-full before:bg-primary"
                >
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mt-14 mb-6 text-2xl font-bold text-brand-deep md:mt-20 md:text-[32px]">
          {t('about.principlesTitle')}
        </h3>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-6 p-0">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.title}
              className="rounded-[10px] border border-line bg-card px-7 py-7"
            >
              <span
                aria-hidden="true"
                className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-primary font-heading text-base font-bold text-primary-foreground"
              >
                {number(i + 1)}
              </span>
              <h4 className="mb-2.5 text-[21px] font-semibold text-ink">
                {t(p.title)}
              </h4>
              <p className="text-base leading-[1.75] text-copy">{t(p.text)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 rounded-[10px] bg-brand-deep px-6 py-9 text-center text-background md:mt-20 md:px-12 md:py-12">
          <h3 className="mb-4 text-2xl font-bold md:text-[32px]">
            {t('about.commitTitle')}
          </h3>
          <p className="mx-auto mb-4 max-w-[62ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('about.commit1')}
          </p>
          <p className="mx-auto mb-6 max-w-[62ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('about.commit2')}
          </p>
          <p className="font-heading text-xl font-semibold text-mint md:text-2xl">
            {t('about.slogan')}
          </p>
        </div>
      </div>
    </section>
  )
}
