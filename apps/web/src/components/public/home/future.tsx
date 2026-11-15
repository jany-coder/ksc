import { useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// "Our future mission": the club's plans, in its own words. These are plans,
// not done work, so the section says so in its title and subtitle.
function Bullets({ title, items }: { title: MessageKey; items: MessageKey[] }) {
  const t = useT()
  return (
    <>
      <h5 className="mt-5 mb-2.5 text-base font-semibold text-brand-deep">
        {t(title)}
      </h5>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((key) => (
          <li
            key={key}
            className="relative pl-5 text-base leading-[1.65] text-copy before:absolute before:top-[0.7em] before:left-0 before:size-2 before:-translate-y-1/2 before:rounded-full before:bg-primary"
          >
            {t(key)}
          </li>
        ))}
      </ul>
    </>
  )
}

const cardClass = 'rounded-[10px] border border-line bg-card px-7 py-7'

export function Future() {
  const t = useT()
  const number = useNumber()
  const badge = (n: number) => (
    <span
      aria-hidden="true"
      className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-primary font-heading text-base font-bold text-primary-foreground"
    >
      {number(n)}
    </span>
  )
  const h4 = 'mb-2.5 text-[21px] font-semibold text-ink md:text-[23px]'
  const p = 'text-base leading-[1.75] text-copy'

  return (
    <section
      id="future"
      className="scroll-mt-4 md:scroll-mt-16 py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-2 text-[28px] font-bold text-brand-deep md:text-[40px]">
          {t('future.title')}
        </h2>
        <p className="mb-6 font-heading text-lg font-semibold text-primary md:text-xl">
          {t('future.subtitle')}
        </p>
        <p className="mb-4 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]">
          {t('future.p1')}
        </p>
        <p className="mb-10 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:mb-12 md:text-[19px]">
          {t('future.p2')}
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-6">
          <article className={cardClass}>
            {badge(1)}
            <h3 className={h4}>{t('future.i1Title')}</h3>
            <p className={`${p} mb-3`}>{t('future.i1Text1')}</p>
            <p className={p}>{t('future.i1Text2')}</p>
          </article>

          <article className={`${cardClass} md:row-span-2`}>
            {badge(2)}
            <h3 className={h4}>{t('future.i2Title')}</h3>
            <p className="mb-2 text-base font-semibold text-primary">
              {t('future.i2Subtitle')}
            </p>
            <p className={p}>{t('future.i2Text')}</p>
            <Bullets
              title="future.i2ListTitle"
              items={[
                'future.i2Topic1',
                'future.i2Topic2',
                'future.i2Topic3',
                'future.i2Topic4',
                'future.i2Topic5',
              ]}
            />
            <p className="mt-5 text-base leading-[1.75] font-semibold text-brand-deep">
              {t('future.i2Aim')}
            </p>
          </article>

          <article className={cardClass}>
            {badge(3)}
            <h3 className={h4}>{t('future.i3Title')}</h3>
            <p className={p}>{t('future.i3Text')}</p>
            <Bullets
              title="future.i3ListTitle"
              items={[
                'future.i3Item1',
                'future.i3Item2',
                'future.i3Item3',
                'future.i3Item4',
              ]}
            />
          </article>

          <article className={cardClass}>
            {badge(4)}
            <h3 className={h4}>{t('future.i4Title')}</h3>
            <p className={`${p} mb-3`}>{t('future.i4Text1')}</p>
            <p className={p}>{t('future.i4Text2')}</p>
          </article>

          <article className={cardClass}>
            {badge(5)}
            <h3 className={h4}>{t('future.i5Title')}</h3>
            <p className={p}>{t('future.i5Text')}</p>
            <Bullets
              title="future.i5ListTitle"
              items={[
                'future.i5Item1',
                'future.i5Item2',
                'future.i5Item3',
                'future.i5Item4',
                'future.i5Item5',
              ]}
            />
          </article>
        </div>

        <div className="mt-12 rounded-[10px] border-l-4 border-primary bg-accent px-6 py-8 md:mt-16 md:px-10 md:py-10">
          <h3 className="mb-1 text-2xl font-bold text-brand-deep md:text-[30px]">
            {t('future.dreamTitle')}
          </h3>
          <p className="mb-5 font-heading text-lg font-semibold text-primary">
            {t('future.dreamSubtitle')}
          </p>
          <p className="mb-4 max-w-[70ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]">
            {t('future.dream1')}
          </p>
          <p className="mb-4 max-w-[70ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]">
            {t('future.dream2')}
          </p>
          <p className="max-w-[70ch] text-[17px] leading-[1.8] font-semibold text-brand-deep md:text-[19px]">
            {t('future.dream3')}
          </p>
        </div>
      </div>
    </section>
  )
}
