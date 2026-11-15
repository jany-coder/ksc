import { Link } from '@tanstack/react-router'

import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { buttonVariants } from '../../ui/button.tsx'

// "Contact and membership": who can join, the fees, what members get, the
// steps, privacy and how to reach the club. The application form itself lives
// at /join, where the consent checkbox and spam protection are.
const ELIGIBILITY: MessageKey[] = [
  'joinSection.elig1',
  'joinSection.elig2',
  'joinSection.elig3',
  'joinSection.elig4',
  'joinSection.elig5',
  'joinSection.elig6',
]
const FEES: MessageKey[] = ['joinSection.fee1', 'joinSection.fee2']
const RIGHTS: MessageKey[] = [
  'joinSection.right1',
  'joinSection.right2',
  'joinSection.right3',
  'joinSection.right4',
  'joinSection.right5',
]
const STEPS: MessageKey[] = [
  'joinSection.step1',
  'joinSection.step2',
  'joinSection.step3',
  'joinSection.step4',
]

const card = 'rounded-[10px] border border-line bg-card p-7 text-copy'
const cardTitle = 'mb-4 text-[22px] font-semibold text-brand-deep'

function List({ items }: { items: MessageKey[] }) {
  const t = useT()
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((key) => (
        <li
          key={key}
          className="relative pl-5 text-base leading-[1.65] before:absolute before:top-[0.7em] before:left-0 before:size-2 before:-translate-y-1/2 before:rounded-full before:bg-primary"
        >
          {t(key)}
        </li>
      ))}
    </ul>
  )
}

export function Join() {
  const t = useT()
  const number = useNumber()
  const localeParams = useLocaleParams()
  return (
    <section
      id="join"
      className="scroll-mt-4 md:scroll-mt-16 bg-primary py-14 text-primary-foreground md:py-[88px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-2 text-[28px] font-bold text-white md:text-[40px]">
          {t('joinSection.title')}
        </h2>
        <p className="mb-6 font-heading text-lg font-semibold text-mint-soft md:text-xl">
          {t('joinSection.subtitle')}
        </p>
        <p className="mb-4 max-w-[70ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
          {t('joinSection.p1')}
        </p>
        <p className="mb-10 max-w-[70ch] text-[17px] leading-[1.8] text-mint-soft md:mb-12 md:text-[19px]">
          {t('joinSection.p2')}
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-6">
          <div className={card}>
            <h3 className={cardTitle}>{t('joinSection.eligTitle')}</h3>
            <List items={ELIGIBILITY} />
          </div>

          <div className="flex flex-col gap-6">
            <div className={card}>
              <h3 className={cardTitle}>{t('joinSection.feesTitle')}</h3>
              <List items={FEES} />
            </div>
            <div className={card}>
              <h3 className={cardTitle}>{t('joinSection.rightsTitle')}</h3>
              <List items={RIGHTS} />
            </div>
          </div>

          <div className={card}>
            <h3 className={cardTitle}>{t('joinSection.stepsTitle')}</h3>
            <ol className="m-0 mb-5 flex list-none flex-col gap-3.5 p-0">
              {STEPS.map((key, i) => (
                <li key={key} className="text-base leading-[1.65]">
                  <span className="mb-0.5 block text-sm font-semibold text-primary">
                    {t('joinSection.stepLabel', { n: number(i + 1) })}
                  </span>
                  {t(key)}
                </li>
              ))}
            </ol>
            <p className="mb-5 rounded-lg bg-accent px-4 py-3 text-[15px] leading-[1.65] text-brand-deep">
              {t('joinSection.bloodNote')}
            </p>
            <Link
              to="/{-$locale}/join"
              params={localeParams}
              className={buttonVariants({
                size: 'lg',
                className: 'h-12 px-6 text-[17px]',
              })}
            >
              {t('joinSection.apply')}
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <div className={card}>
              <h3 className={cardTitle}>{t('joinSection.privacyTitle')}</h3>
              <p className="text-base leading-[1.75]">
                {t('joinSection.privacyText')}
              </p>
            </div>
            <div className={card}>
              <h3 className={cardTitle}>{t('joinSection.contactTitle')}</h3>
              <p className="mb-1 font-semibold text-ink">{t('site.name')}</p>
              <p className="mb-3 text-base leading-[1.7]">
                {t('joinSection.address')}
              </p>
              <p className="mb-3 text-base leading-[1.7]">
                {t('joinSection.emailLabel')}{' '}
                <a
                  href="mailto:kalmasocialclub24@gmail.com"
                  className="break-all font-semibold text-primary underline-offset-2 hover:underline"
                >
                  kalmasocialclub24@gmail.com
                </a>
              </p>
              <p className="mb-2 text-base leading-[1.7]">
                {t('joinSection.facebookLabel')}
              </p>
              <a
                href="https://www.facebook.com/profile.php?id=100068969464914"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                {t('joinSection.facebookCta')}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center md:mt-16">
          <p className="mb-3 text-[19px] font-semibold text-white md:text-2xl">
            {t('joinSection.closing1')}
          </p>
          <p className="mx-auto max-w-[56ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('joinSection.closing2')}
          </p>
        </div>
      </div>
    </section>
  )
}
