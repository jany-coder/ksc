import {
  Droplet,
  GraduationCap,
  Handshake,
  Leaf,
  Users,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// The six kinds of work the club names. Red is reserved for blood-related
// items only (CLAUDE.md section 8), so only the last icon uses it.
const ITEMS: {
  title: MessageKey
  text: MessageKey
  icon: LucideIcon
  iconClass: string
}[] = [
  {
    title: 'whatWeDo.harmonyTitle',
    text: 'whatWeDo.harmonyText',
    icon: Handshake,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.youthTitle',
    text: 'whatWeDo.youthText',
    icon: Users,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.skillsTitle',
    text: 'whatWeDo.skillsText',
    icon: Wrench,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.educationTitle',
    text: 'whatWeDo.educationText',
    icon: GraduationCap,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.environmentTitle',
    text: 'whatWeDo.environmentText',
    icon: Leaf,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.bloodTitle',
    text: 'whatWeDo.bloodText',
    icon: Droplet,
    iconClass: 'text-blood',
  },
]

export function WhatWeDo() {
  const t = useT()
  return (
    <section
      id="what-we-do"
      className="scroll-mt-4 md:scroll-mt-16 py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-9 text-[28px] font-bold text-brand-deep md:mb-12 md:text-[40px]">
          {t('whatWeDo.title')}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
          {ITEMS.map(({ title, text, icon: Icon, iconClass }) => (
            <article
              key={title}
              className="lift rounded-[10px] border border-line bg-card px-7 py-8"
            >
              <Icon
                className={`size-[34px] ${iconClass}`}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <h3 className="mt-[18px] mb-2.5 text-[23px] font-semibold text-ink">
                {t(title)}
              </h3>
              <p className="text-[17px] leading-[1.7] text-copy">{t(text)}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[10px] border-l-4 border-primary bg-accent px-6 py-7 md:mt-16 md:px-10 md:py-9">
          <h3 className="mb-3 text-2xl font-bold text-brand-deep md:text-[28px]">
            {t('philosophy.title')}
          </h3>
          <p className="mb-4 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]">
            {t('philosophy.p1')}
          </p>
          <p className="max-w-[68ch] text-[17px] leading-[1.8] font-semibold text-brand-deep md:text-[19px]">
            {t('philosophy.p2')}
          </p>
        </div>
      </div>
    </section>
  )
}
