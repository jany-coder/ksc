import { Outlet, createFileRoute } from '@tanstack/react-router'

import { MobileTabBar } from '../../components/public/mobile-tab-bar.tsx'
import { SiteFooter } from '../../components/public/site-footer.tsx'
import { SiteHeader } from '../../components/public/site-header.tsx'

// Pathless layout: "_public" never appears in a URL. Every public page lives
// inside it, so they share the header, footer and the public theme (warm
// ground, deep green, larger text for older readers).
export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

function PublicLayout() {
  return (
    // pb-[60px] keeps the last content clear of the fixed bottom tab bar.
    <div className="theme-public min-h-screen scroll-smooth bg-background pb-[60px] text-ink md:pb-0">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}
