import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  CircleCheck,
  ListOrdered,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import { SectionHeading } from '../section-heading.tsx'
import { iconTile } from '../styles.ts'
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
  id,
  className = '',
  children,
}: {
  icon: LucideIcon
  title: MessageKey
  id?: string
  className?: string
  children: ReactNode
}) {
  const t = useT()
  return (
    <div
      id={id}
      className={`flex h-full scroll-mt-4 flex-col rounded-2xl bg-card p-6 text-copy shadow-lift md:scroll-mt-16 md:p-8 ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className={iconTile}>
          <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
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
        <li key={key} className="flex gap-3 text-base leading-[1.65]">
          <CircleCheck
            aria-hidden="true"
            className="mt-1 size-[18px] shrink-0 text-primary"
            strokeWidth={2}
          />
          <span>{t(key)}</span>
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
      // Deep green, like the gallery: the mint text keeps its contrast here.
      className="scroll-mt-4 bg-brand-deep py-14 text-white md:scroll-mt-16 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <SectionHeading
          tone="dark"
          title={t('joinSection.title')}
          subtitle={t('joinSection.subtitle')}
        >
          <p className="max-w-[70ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('joinSection.p1')}
          </p>
          <p className="max-w-[70ch] text-[17px] leading-[1.8] text-mint-soft md:text-[19px]">
            {t('joinSection.p2')}
          </p>
        </SectionHeading>

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
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent font-heading text-[15px] font-bold text-primary"
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

          {/* id="contact": the phone "Need blood?" shortcut jumps straight here. */}
          <Card icon={Mail} title="joinSection.contactTitle" id="contact">
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
