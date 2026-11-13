import { Droplet, GraduationCap, House, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Static copy from the approved design. Red is reserved for blood-related
// items only (CLAUDE.md section 8), so only the first icon uses it.
const ITEMS: {
  title: string
  text: string
  icon: LucideIcon
  iconClass: string
}[] = [
  {
    title: 'রক্তদান',
    text: 'সদস্যদের রক্তের গ্রুপ আমাদের ডেটাবেজে রাখা থাকে, যাতে জরুরি মুহূর্তে দ্রুত দাতা পাওয়া যায়।',
    icon: Droplet,
    iconClass: 'text-blood',
  },
  {
    title: 'শিক্ষা সহায়তা',
    text: 'এলাকার শিক্ষার্থীদের বইপত্র, শিক্ষা উপকরণ ও পরীক্ষার প্রস্তুতিতে সহায়তা করা।',
    icon: GraduationCap,
    iconClass: 'text-primary',
  },
  {
    title: 'যুব উন্নয়ন',
    text: 'তরুণদের খেলাধুলা, দক্ষতা প্রশিক্ষণ ও নেতৃত্বের সুযোগ তৈরি করে সঠিক পথে রাখা।',
    icon: Users,
    iconClass: 'text-primary',
  },
  {
    title: 'সমাজসেবা',
    text: 'শীতবস্ত্র ও ত্রাণ বিতরণ, পরিচ্ছন্নতা অভিযান এবং অসহায় পরিবারের পাশে দাঁড়ানো।',
    icon: House,
    iconClass: 'text-primary',
  },
]

export function WhatWeDo() {
  return (
    <section id="kaj" className="scroll-mt-4 py-14 md:py-[92px]">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-3.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
          আমরা কী করি
        </h2>
        <p className="mb-9 max-w-[62ch] text-[17px] leading-relaxed text-copy md:mb-12 md:text-[19px] md:leading-[1.65]">
          চারটি কাজে আমরা নিয়মিত সময় দিই। প্রতিটি কার্যক্রম এলাকার মানুষের সরাসরি
          প্রয়োজন থেকে এসেছে।
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-6">
          {ITEMS.map(({ title, text, icon: Icon, iconClass }) => (
            <article
              key={title}
              className="rounded-[10px] border border-line bg-card px-7 py-8"
            >
              <Icon
                className={`size-[34px] ${iconClass}`}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              <h3 className="mt-[18px] mb-2.5 text-[23px] font-semibold text-ink">
                {title}
              </h3>
              <p className="text-[17px] leading-[1.7] text-copy">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
