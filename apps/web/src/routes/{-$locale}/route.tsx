import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import { MobileTabBar } from '../../components/public/mobile-tab-bar.tsx'
import { SiteFooter } from '../../components/public/site-footer.tsx'
import { SectionBar } from '../../components/public/section-bar.tsx'
import { SiteHeader } from '../../components/public/site-header.tsx'

// Layout for every public page: they share the header, footer and the public
// theme (warm ground, deep green, larger text for older readers). The optional
// "{-$locale}" part of the path is "en" for English and absent for Bengali.
export const Route = createFileRoute('/{-$locale}')({
  // "/en/..." is English and no prefix is Bengali. Anything else in that first
  // slot ("/foo") is simply a page that does not exist.
  beforeLoad: ({ params }) => {
    if (params.locale !== undefined && params.locale !== 'en') throw notFound()
  },
  component: PublicLayout,
})

function PublicLayout() {
  return (
    // pb-[60px] keeps the last content clear of the fixed bottom tab bar.
    <div className="theme-public min-h-screen scroll-smooth bg-background pb-[60px] text-ink md:pb-0">
      <SiteHeader />
      <SectionBar />
      <Outlet />
      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}
