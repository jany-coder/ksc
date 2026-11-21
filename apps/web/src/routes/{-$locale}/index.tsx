import { createFileRoute } from '@tanstack/react-router'

import {
  listRecentActivitiesFn,
  listUpcomingActivitiesFn,
} from '../../lib/activities.functions.ts'
import { listHomeImagesFn } from '../../lib/images.functions.ts'
import { imageSrcSet, imageUrl } from '../../lib/image-limits.ts'
import { alternateLinks } from '../../lib/i18n/hreflang.ts'
import { tFor } from '../../lib/i18n/messages.ts'
import { listPublicNoticesFn } from '../../lib/notices.functions.ts'
import { Activities } from '../../components/public/home/activities.tsx'
import { About } from '../../components/public/home/about.tsx'
import { Future } from '../../components/public/home/future.tsx'
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
      links: alternateLinks(''),
      meta: [
        { title: t('home.title') },
        { name: 'description', content: t('home.description') },
      ],
    }
  },
  // Public data for every visitor: the newest past activities, published
  // activities happening today or later, notices and photos.
  loader: async () => {
    const [recent, upcoming, notices, images] = await Promise.all([
      listRecentActivitiesFn(),
      listUpcomingActivitiesFn(),
      listPublicNoticesFn(),
      listHomeImagesFn(),
    ])
    return { recent, upcoming, notices, images }
  },
  component: Home,
})

function Home() {
  const { recent, upcoming, notices, images } = Route.useLoaderData()
  return (
    <main>
      <Hero />
      <QuickActions />
      <WhatWeDo />
      <About />
      <Activities items={recent} />
      <UpcomingActivities items={upcoming} />
      <NoticeBoard items={notices} />
      <GalleryTeaser
        photos={images.map((image) => ({
          id: image.id,
          thumbUrl: imageUrl(image.id, 'thumb'),
          srcSet: imageSrcSet(image.id, image.width),
        }))}
      />
      <Future />
      <Join />
    </main>
  )
}
