import { Droplet, GraduationCap, House, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// The club's four kinds of work. Red is reserved for blood-related items only
// (CLAUDE.md section 8), so only the first icon uses it.
const ITEMS: {
  title: MessageKey
  text: MessageKey
  icon: LucideIcon
  iconClass: string
}[] = [
  {
    title: 'whatWeDo.bloodTitle',
    text: 'whatWeDo.bloodText',
    icon: Droplet,
    iconClass: 'text-blood',
  },
  {
    title: 'whatWeDo.educationTitle',
    text: 'whatWeDo.educationText',
    icon: GraduationCap,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.youthTitle',
    text: 'whatWeDo.youthText',
    icon: Users,
    iconClass: 'text-primary',
  },
  {
    title: 'whatWeDo.socialTitle',
    text: 'whatWeDo.socialText',
    icon: House,
    iconClass: 'text-primary',
  },
]

export function WhatWeDo() {
  const t = useT()
  return (
    <section id="what-we-do" className="scroll-mt-4 py-14 md:py-[92px]">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-3.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
          {t('whatWeDo.title')}
        </h2>
        <p className="mb-9 max-w-[62ch] text-[17px] leading-relaxed text-copy md:mb-12 md:text-[19px] md:leading-[1.65]">
          {t('whatWeDo.lead')}
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-6">
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
      </div>
    </section>
  )
}
