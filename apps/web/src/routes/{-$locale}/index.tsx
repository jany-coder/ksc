import { createFileRoute } from '@tanstack/react-router'

import {
  listRecentActivitiesFn,
  listUpcomingActivitiesFn,
} from '../../lib/activities.functions.ts'
import { heroPhotosFn, listHomeImagesFn } from '../../lib/images.functions.ts'
import { imageSrcSet, imageUrl } from '../../lib/image-limits.ts'
import { alternateLinks } from '../../lib/i18n/hreflang.ts'
import { tFor } from '../../lib/i18n/messages.ts'
import { listPublicNoticesFn } from '../../lib/notices.functions.ts'
import { publicData } from '../../lib/public-data.ts'
import { Activities } from '../../components/public/home/activities.tsx'
import { About } from '../../components/public/home/about.tsx'
import { Future } from '../../components/public/home/future.tsx'
import { GalleryTeaser } from '../../components/public/home/gallery-teaser.tsx'
import { Hero } from '../../components/public/home/hero.tsx'
import { Highlights } from '../../components/public/home/highlights.tsx'
import { QuickActions } from '../../components/public/home/quick-actions.tsx'
import { Join } from '../../components/public/home/join.tsx'
import { NoticeBoard } from '../../components/public/home/notice-board.tsx'
import { UpcomingActivities } from '../../components/public/home/upcoming-activities.tsx'
import { WhatWeDo } from '../../components/public/home/what-we-do.tsx'

export const Route = createFileRoute('/{-$locale}/')({
  // Public data for every visitor: the newest past activities, published
  // activities happening today or later, notices and photos.
  // Kept for a while and shared by both languages (see publicData).
  loader: async ({ context: { queryClient } }) => {
    const [recent, upcoming, notices, images, hero] = await Promise.all([
      publicData(queryClient, ['recent'], () => listRecentActivitiesFn()),
      publicData(queryClient, ['upcoming'], () => listUpcomingActivitiesFn()),
      publicData(queryClient, ['notices'], () => listPublicNoticesFn()),
      publicData(queryClient, ['home-images'], () => listHomeImagesFn()),
      publicData(queryClient, ['hero'], () => heroPhotosFn()),
    ])
    return { recent, upcoming, notices, images, hero }
  },
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
  component: Home,
})

function Home() {
  const { recent, upcoming, notices, images, hero } = Route.useLoaderData()
  return (
    <main>
      {/* Its own photos, picked in the admin gallery apart from these. */}
      <Hero photos={hero} />
      {/* The next activity, when one is coming, rising over the hero's edge. */}
      <Highlights upcoming={upcoming} />
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
