import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { HERO_SLIDE_COUNT, imageUrl } from '../../lib/image-limits.ts'
import { setHeroPhotosFn } from '../../lib/images.functions.ts'
import type { HeroPhotos } from '../../lib/images.server.ts'
import { useNumber, useT } from '../../lib/i18n/index.tsx'
import { Button } from '../ui/button.tsx'

// Picking the photos for the hero at the top of the homepage: one behind it,
// and up to six that take turns in its photo frame. Every change saves the
// whole hero at once (see setHeroPhotos).

export type Hero = { backgroundId: string | null; slideIds: string[] }

export const idsOf = (hero: HeroPhotos): Hero => ({
  backgroundId: hero.background?.id ?? null,
  slideIds: hero.slides.map((photo) => photo.id),
})

export function useSaveHero(onError: (message: string | null) => void) {
  const t = useT()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (next: Hero) => setHeroPhotosFn({ data: next }),
    onSuccess: async (result) => {
      onError(result.ok ? null : t('heroPick.saveError'))
      await queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: () => onError(t('heroPick.saveError')),
  })
}

/** The panel at the top of the gallery: what the hero shows now, in order. */
export function HeroPanel({
  hero,
  onError,
}: {
  hero: HeroPhotos
  onError: (message: string | null) => void
}) {
  const t = useT()
  const number = useNumber()
  const save = useSaveHero(onError)
  const current = idsOf(hero)
  const slides = hero.slides

  const move = (from: number, to: number) => {
    const slideIds = [...current.slideIds]
    const [id] = slideIds.splice(from, 1)
    slideIds.splice(to, 0, id!)
    save.mutate({ ...current, slideIds })
  }

  return (
    <section
      aria-labelledby="hero-picker-title"
      className="rounded-[10px] border border-border bg-card p-4"
    >
      <h2 id="hero-picker-title" className="text-[15px] font-semibold">
        {t('heroPick.pickerTitle')}
      </h2>
      <p className="mt-0.5 mb-4 text-sm text-muted-foreground">
        {t('heroPick.pickerLead')}
      </p>

      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="min-w-0">
          <h3 className="mb-2 text-sm font-medium">
            {t('heroPick.backgroundTitle')}
          </h3>
          {hero.background ? (
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={imageUrl(hero.background.id, 'thumb')}
                alt={t('heroPick.backgroundAlt')}
                width={hero.background.width}
                height={hero.background.height}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute end-1.5 top-1.5"
                aria-label={t('heroPick.backgroundRemove')}
                disabled={save.isPending}
                onClick={() => save.mutate({ ...current, backgroundId: null })}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-[13px] text-muted-foreground">
              {t('heroPick.backgroundEmpty')}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="mb-2 text-sm font-medium">
            {t('heroPick.slidesTitle', {
              n: number(slides.length),
              max: number(HERO_SLIDE_COUNT),
            })}
          </h3>
          {slides.length > 0 ? (
            <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 min-[480px]:grid-cols-3 lg:grid-cols-6">
              {slides.map((photo, i) => (
                <li
                  key={photo.id}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  <div className="relative">
                    <img
                      src={imageUrl(photo.id, 'thumb')}
                      alt={t('heroPick.slideAlt', { n: number(i + 1) })}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute start-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-card/90 text-xs font-semibold"
                    >
                      {number(i + 1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('heroPick.moveEarlier')}
                      disabled={save.isPending || i === 0}
                      onClick={() => move(i, i - 1)}
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('heroPick.slideRemove')}
                      disabled={save.isPending}
                      onClick={() =>
                        save.mutate({
                          ...current,
                          slideIds: current.slideIds.filter(
                            (id) => id !== photo.id,
                          ),
                        })
                      }
                    >
                      <X aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('heroPick.moveLater')}
                      disabled={save.isPending || i === slides.length - 1}
                      onClick={() => move(i, i + 1)}
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-[13px] text-muted-foreground">
              {t('heroPick.slidesEmpty')}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
