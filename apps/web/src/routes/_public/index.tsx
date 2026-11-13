import { createFileRoute } from '@tanstack/react-router'

import { About } from '../../components/public/home/about.tsx'
import { GalleryTeaser } from '../../components/public/home/gallery-teaser.tsx'
import { Hero } from '../../components/public/home/hero.tsx'
import { QuickActions } from '../../components/public/home/quick-actions.tsx'
import { NoticeBoard } from '../../components/public/home/notice-board.tsx'
import { UpcomingActivities } from '../../components/public/home/upcoming-activities.tsx'
import { WhatWeDo } from '../../components/public/home/what-we-do.tsx'

export const Route = createFileRoute('/_public/')({
  head: () => ({
    meta: [
      { title: 'কলমা সোশ্যাল ক্লাব — সাভার, ঢাকা' },
      {
        name: 'description',
        content:
          'এলাকার মানুষের পাশে থাকা একটি অরাজনৈতিক সামাজিক সংগঠন। রক্তদান, শিক্ষা সহায়তা, ত্রাণ ও যুব উন্নয়ন।',
      },
    ],
  }),
  component: Home,
})

function Home() {
  return (
    <main>
      <Hero />
      <QuickActions />
      <WhatWeDo />
      <UpcomingActivities />
      <NoticeBoard />
      <GalleryTeaser />
      <About />
    </main>
  )
}
