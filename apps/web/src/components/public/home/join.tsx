import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  ListOrdered,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { buttonVariants } from '../../ui/button.tsx'

// "Contact and membership": who can join, what members get, the steps,
// privacy and how to reach the club. The application form itself lives at
// /join, where the consent checkbox and spam protection are.
const ELIGIBILITY: MessageKey[] = [
  'joinSection.elig1',
  'joinSection.elig2',
  'joinSection.elig3',
  'joinSection.elig4',
  'joinSection.elig5',
  'joinSection.elig6',
]
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

/** A white card with an icon and a heading. Grows to the height of its row. */
function Card({
  icon: Icon,
  title,
  className = '',
  children,
}: {
  icon: LucideIcon
  title: MessageKey
  className?: string
  children: ReactNode
}) {
  const t = useT()
  return (
    <div
      className={`flex h-full flex-col rounded-[12px] bg-card p-7 text-copy shadow-[0_1px_2px_rgba(0,0,0,0.06)] md:p-8 ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent">
          <Icon
            className="size-[22px] text-primary"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h3 className="text-[21px] leading-snug font-semibold text-brand-deep md:text-[22px]">
          {t(title)}
        </h3>
      </div>
      {children}
    </div>
  )
}

function List({ items }: { items: MessageKey[] }) {
  const t = useT()
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
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

        {/* Phone: one column. Tablet: two. Desktop: three across on top
            (who can join, rights, how to join), then privacy (wide) and
            contact underneath. */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card icon={UserCheck} title="joinSection.eligTitle">
            <List items={ELIGIBILITY} />
          </Card>

          <Card icon={BadgeCheck} title="joinSection.rightsTitle">
            <List items={RIGHTS} />
          </Card>

          <Card
            icon={ListOrdered}
            title="joinSection.stepsTitle"
            className="md:col-span-2 lg:col-span-1"
          >
            <ol className="m-0 mb-6 flex list-none flex-col gap-4 p-0">
              {STEPS.map((key, i) => (
                <li key={key} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-[15px] font-bold text-primary-foreground"
                  >
                    {number(i + 1)}
                  </span>
                  <span className="pt-0.5 text-base leading-[1.65]">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mb-6 rounded-lg bg-accent px-4 py-3 text-[15px] leading-[1.65] text-brand-deep">
              {t('joinSection.bloodNote')}
            </p>
            <Link
              to="/{-$locale}/join"
              params={localeParams}
              className={buttonVariants({
                size: 'lg',
                className: 'mt-auto h-12 w-full px-6 text-[17px]',
              })}
            >
              {t('joinSection.apply')}
            </Link>
          </Card>

          <Card
            icon={ShieldCheck}
            title="joinSection.privacyTitle"
            className="lg:col-span-2"
          >
            <p className="max-w-[72ch] text-base leading-[1.8]">
              {t('joinSection.privacyText')}
            </p>
          </Card>

          <Card icon={Mail} title="joinSection.contactTitle">
            <p className="mb-1 font-semibold text-ink">{t('site.name')}</p>
            <p className="mb-4 text-base leading-[1.7]">
              {t('joinSection.address')}
            </p>
            <p className="mb-4 text-base leading-[1.7]">
              {t('joinSection.emailLabel')}{' '}
              <a
                href="mailto:kalmasocialclub24@gmail.com"
                className="break-all font-semibold text-primary underline-offset-2 hover:underline"
              >
                kalmasocialclub24@gmail.com
              </a>
            </p>
            <a
              href="https://www.facebook.com/profile.php?id=100068969464914"
              rel="noopener noreferrer"
              className="mt-auto font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t('joinSection.facebookCta')}
            </a>
          </Card>
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
