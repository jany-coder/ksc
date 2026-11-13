import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '../../components/public/home/hero.tsx'

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
    </main>
  )
}
