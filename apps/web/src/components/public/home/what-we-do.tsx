import {
  Droplet,
  GraduationCap,
  Handshake,
  Leaf,
  Quote,
  Users,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { cn } from '../../../lib/utils.ts'
import { SectionHeading } from '../section-heading.tsx'
import { bloodTile, iconTile, liftCard } from '../styles.ts'

// The six kinds of work the club names. Red is reserved for blood-related
// items only (CLAUDE.md section 8), so only the last tile uses it. The hero
// lists them too, when it has no photos to show.
export const WORK_AREAS: {
  title: MessageKey
  text: MessageKey
  icon: LucideIcon
  // Blood-related: the only item drawn in red.
  blood?: boolean
}[] = [
  {
    title: 'whatWeDo.harmonyTitle',
    text: 'whatWeDo.harmonyText',
    icon: Handshake,
  },
  {
    title: 'whatWeDo.youthTitle',
    text: 'whatWeDo.youthText',
    icon: Users,
  },
  {
    title: 'whatWeDo.skillsTitle',
    text: 'whatWeDo.skillsText',
    icon: Wrench,
  },
  {
    title: 'whatWeDo.educationTitle',
    text: 'whatWeDo.educationText',
    icon: GraduationCap,
  },
  {
    title: 'whatWeDo.environmentTitle',
    text: 'whatWeDo.environmentText',
    icon: Leaf,
  },
  {
    title: 'whatWeDo.bloodTitle',
    text: 'whatWeDo.bloodText',
    icon: Droplet,
    blood: true,
  },
]

export function WhatWeDo() {
  const t = useT()
  return (
    <section
      id="what-we-do"
      className="scroll-mt-4 py-14 md:scroll-mt-16 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <SectionHeading title={t('whatWeDo.title')} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-5 md:gap-6">
          {WORK_AREAS.map(({ title, text, icon: Icon, blood }) => (
            <article key={title} className={cn(liftCard, 'p-5 md:p-7')}>
              {/* Phone: the icon beside the title, so the six cards stay
                  short; wider screens: the icon above. */}
              <div className="mb-2 flex items-center gap-3.5 md:mb-0 md:block">
                <span className={blood ? bloodTile : iconTile}>
                  <Icon
                    className="size-6"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <h3 className="text-[20px] leading-snug font-semibold text-ink md:mt-5 md:mb-2 md:text-[22px]">
                  {t(title)}
                </h3>
              </div>
              <p className="text-[17px] leading-[1.7] text-copy">{t(text)}</p>
            </article>
          ))}
        </div>

        {/* The club's philosophy, set apart as a quote. */}
        <figure className="relative mt-12 overflow-hidden rounded-3xl bg-brand-deep px-6 py-9 text-white md:mt-16 md:px-12 md:py-12">
          <Quote
            aria-hidden="true"
            className="absolute -top-2 right-6 size-28 text-white/[0.06] md:size-40"
          />
          <h3 className="mb-4 text-2xl font-bold md:text-[30px]">
            {t('philosophy.title')}
          </h3>
          <blockquote className="relative">
            <p className="mb-5 max-w-[70ch] text-[17px] leading-[1.85] text-mint-soft md:text-[19px]">
              {t('philosophy.p1')}
            </p>
            <p className="max-w-[70ch] border-s-2 border-mint ps-4 text-[17px] leading-[1.8] font-semibold text-white md:text-[19px]">
              {t('philosophy.p2')}
            </p>
          </blockquote>
        </figure>
      </div>
    </section>
  )
}
