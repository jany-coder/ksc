import { createFileRoute } from '@tanstack/react-router'

import { listUpcomingActivitiesFn } from '../../lib/activities.functions.ts'
import { listPublicImagesFn } from '../../lib/images.functions.ts'
import { imageUrl } from '../../lib/image-limits.ts'
import { tFor } from '../../lib/i18n/messages.ts'
import { listPublicNoticesFn } from '../../lib/notices.functions.ts'
import { About } from '../../components/public/home/about.tsx'
import { GalleryTeaser } from '../../components/public/home/gallery-teaser.tsx'
import { Hero } from '../../components/public/home/hero.tsx'
import { QuickActions } from '../../components/public/home/quick-actions.tsx'
import { Join } from '../../components/public/home/join.tsx'
import { NoticeBoard } from '../../components/public/home/notice-board.tsx'
import { UpcomingActivities } from '../../components/public/home/upcoming-activities.tsx'
import { WhatWeDo } from '../../components/public/home/what-we-do.tsx'

export const Route = createFileRoute('/{-$locale}/')({
  head: ({ params }) => {
    const t = tFor(params.locale === 'en' ? 'en' : 'bn')
    return {
      meta: [
        { title: t('home.title') },
        { name: 'description', content: t('home.description') },
      ],
    }
  },
  // Public data for every visitor: published activities happening today or
  // later, and published notices.
  loader: async () => {
    const [upcoming, notices, images] = await Promise.all([
      listUpcomingActivitiesFn(),
      listPublicNoticesFn(),
      listPublicImagesFn({ data: { limit: 6 } }),
    ])
    return { upcoming, notices, images }
  },
  component: Home,
})

function Home() {
  const { upcoming, notices, images } = Route.useLoaderData()
  return (
    <main>
      <Hero />
      <QuickActions />
      <WhatWeDo />
      <UpcomingActivities items={upcoming} />
      <NoticeBoard items={notices} />
      <GalleryTeaser
        photos={images.map((image) => ({
          id: image.id,
          thumbUrl: imageUrl(image.id, 'thumb'),
        }))}
      />
      <About />
      <Join />
    </main>
  )
}
