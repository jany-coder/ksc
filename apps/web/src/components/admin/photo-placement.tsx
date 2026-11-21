import { GalleryHorizontalEnd, House, Wallpaper } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { HERO_SLIDE_COUNT, HOME_PHOTO_COUNT } from '../../lib/image-limits.ts'
import type { HeroPhotos } from '../../lib/images.server.ts'
import { useNumber, useT } from '../../lib/i18n/index.tsx'
import { cn } from '../../lib/utils.ts'
import { idsOf, useSaveHero } from './hero-picker.tsx'
import { useSetOnHome } from './photo-controls.tsx'

// Where a photo shows on the homepage, as three small round buttons laid on
// the photo itself: the homepage gallery, the hero's frame and the hero's
// background. Green when on. The legend above the grid names each icon, and
// each button's name shows on hover and is read out by screen readers.

const PLACES = {
  home: { icon: House, label: 'gal.onHome' },
  frame: { icon: GalleryHorizontalEnd, label: 'heroPick.inFrame' },
  background: { icon: Wallpaper, label: 'heroPick.asBackground' },
} as const

function PlaceButton({
  place,
  on,
  full,
  busy,
  onClick,
  children,
}: {
  place: keyof typeof PLACES
  on: boolean
  /** No room left: a click explains that instead of saving. */
  full?: boolean
  busy: boolean
  onClick: () => void
  children?: ReactNode
}) {
  const t = useT()
  const { icon: Icon, label } = PLACES[place]
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={t(label)}
      title={t(label)}
      disabled={busy}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border px-1.5 text-xs font-semibold shadow-sm backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait',
        on
          ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-white/40 bg-black/45 text-white hover:bg-black/65',
        full && !on && 'opacity-60',
      )}
    >
      <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
      {children}
    </button>
  )
}

/** The three buttons, for the bottom corner of one photo in the grid. */
export function PlacementButtons({
  id,
  onHome,
  homeFull,
  hero,
  onError,
  className,
}: {
  id: string
  onHome: boolean
  homeFull: boolean
  hero: HeroPhotos
  onError: (message: string | null) => void
  className?: string
}) {
  const t = useT()
  const number = useNumber()
  const home = useSetOnHome(id, onError)
  const save = useSaveHero(onError)
  const current = idsOf(hero)
  const framePlace = current.slideIds.indexOf(id)
  const inFrame = framePlace >= 0
  const frameFull = current.slideIds.length >= HERO_SLIDE_COUNT
  const isBackground = current.backgroundId === id
  const busy = home.isPending || save.isPending

  return (
    <div className={cn('flex gap-1.5', className)}>
      <PlaceButton
        place="home"
        on={onHome}
        full={homeFull}
        busy={busy}
        onClick={() =>
          homeFull && !onHome
            ? onError(t('gal.homeFull', { max: number(HOME_PHOTO_COUNT) }))
            : home.mutate(!onHome)
        }
      />
      <PlaceButton
        place="frame"
        on={inFrame}
        full={frameFull}
        busy={busy}
        onClick={() =>
          frameFull && !inFrame
            ? onError(
                t('heroPick.frameFull', { max: number(HERO_SLIDE_COUNT) }),
              )
            : save.mutate({
                ...current,
                slideIds: inFrame
                  ? current.slideIds.filter((other) => other !== id)
                  : [...current.slideIds, id],
              })
        }
      >
        {/* Its place in the frame's order. */}
        {inFrame && (
          <span aria-hidden="true" className="pe-0.5">
            {number(framePlace + 1)}
          </span>
        )}
      </PlaceButton>
      {/* Only one photo can be the background: turning it on here moves it
          off whichever photo had it. */}
      <PlaceButton
        place="background"
        on={isBackground}
        busy={busy}
        onClick={() =>
          save.mutate({ ...current, backgroundId: isBackground ? null : id })
        }
      />
    </div>
  )
}

/** One line above the grid saying what each icon means. */
export function PlacementLegend() {
  const t = useT()
  const items: { icon: LucideIcon; label: string }[] = (
    ['home', 'frame', 'background'] as const
  ).map((place) => ({
    icon: PLACES[place].icon,
    label: t(PLACES[place].label),
  }))
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
      <span>{t('gal.legend')}</span>
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-secondary text-foreground">
            <Icon aria-hidden="true" className="size-3.5" />
          </span>
          {label}
        </span>
      ))}
      <span>{t('gal.legendOn')}</span>
    </p>
  )
}
