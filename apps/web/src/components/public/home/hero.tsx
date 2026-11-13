import { Link } from '@tanstack/react-router'

import { buttonVariants } from '../../ui/button.tsx'
import { cn } from '../../../lib/utils.ts'

// The counts are placeholders on purpose: the club has not supplied real
// numbers, and nothing here may be invented (CLAUDE.md section 8). 2024 is the
// founding year from the club's own details.
const STATS = [
  { value: '[সংখ্যা]', label: 'নিবন্ধিত সদস্য' },
  { value: '[সংখ্যা]', label: 'রক্তদাতা' },
  { value: '[সংখ্যা]', label: 'সম্পন্ন কার্যক্রম' },
  { value: '২০২৪', label: 'প্রতিষ্ঠার বছর' },
]

export function Hero() {
  return (
    <section className="bg-brand-deep py-7 text-background md:py-24">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-14 px-5 md:px-8">
        <div className="min-w-0 flex-[999_1_460px]">
          <p className="mb-2.5 text-sm font-medium text-mint md:mb-[18px] md:text-lg">
            <span className="md:hidden">সাভার, ঢাকা · প্রতিষ্ঠা ২০২৪</span>
            <span className="hidden md:inline">
              কলমা ১ (আমতলা), ডেইরি ফার্ম, সাভার, ঢাকা
            </span>
          </p>
          <h1 className="mb-3 text-[29px] leading-[1.25] font-bold text-balance md:mb-6 md:text-[60px] md:leading-[1.18]">
            এলাকার মানুষের পাশে থাকা একটি অরাজনৈতিক সামাজিক সংগঠন
          </h1>
          <p className="mb-[18px] max-w-[60ch] text-base leading-relaxed text-mint-soft md:mb-9 md:text-[21px] md:leading-[1.7]">
            <span className="md:hidden">
              রক্তদান, শিক্ষা সহায়তা, ত্রাণ ও যুব উন্নয়ন নিয়ে আমাদের কাজ।
            </span>
            <span className="hidden md:inline">
              আমরা রক্তদান, শিক্ষা সহায়তা, ত্রাণ ও যুব উন্নয়ন নিয়ে কাজ করি। তরুণ আর
              প্রবীণ — সবাই এখানে সমান অংশীদার।
            </span>
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              to="/"
              hash="join"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-h-12 w-full bg-background px-[26px] text-[17px] text-brand-deep hover:bg-background/90 md:w-auto',
              )}
            >
              সদস্য হোন
            </Link>
            <Link
              to="/"
              hash="what-we-do"
              className="hidden min-h-12 items-center justify-center rounded-lg border-[1.5px] border-[#4a6e5c] px-[26px] text-[17px] font-semibold text-background hover:border-mint md:inline-flex"
            >
              আমাদের কাজ দেখুন
            </Link>
          </div>
        </div>

        <dl className="hidden min-w-0 flex-[1_1_320px] grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))] gap-px border border-mint-line bg-mint-line md:grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-brand-deep px-[22px] py-7">
              <dd className="font-heading text-[40px] leading-tight font-bold text-background">
                {stat.value}
              </dd>
              <dt className="mt-1 text-[15px] text-mint-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
