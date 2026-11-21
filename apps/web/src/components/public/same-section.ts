import type { MouseEvent } from 'react'

/**
 * onClick for a link to a section of the page (`#what-we-do`). The router
 * scrolls to a section only when the address changes, so once the address
 * already ends in that `#...` (the visitor followed the link, then scrolled
 * away), a second click did nothing. This scrolls there itself in that case,
 * and leaves every other click to the router.
 */
export function scrollToSameSection(event: MouseEvent<HTMLAnchorElement>) {
  const link = event.currentTarget
  if (
    !link.hash ||
    link.pathname !== window.location.pathname ||
    link.hash !== window.location.hash
  )
    return
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)))
  if (!target) return
  event.preventDefault()
  // Follows the page's own scroll-behavior, so it glides only where the page
  // already does, and each section's scroll-margin keeps the header clear.
  target.scrollIntoView({ block: 'start' })
}
