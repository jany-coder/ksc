import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { HOME_PHOTO_COUNT } from '../../lib/image-limits.ts'
import {
  deleteImageFn,
  setImageCaptionFn,
  setImageOnHomeFn,
} from '../../lib/images.functions.ts'
import { useNumber, useT } from '../../lib/i18n/index.tsx'
import { Button } from '../ui/button.tsx'
import { Input } from '../ui/input.tsx'

// Controls on one photo tile, shared by the gallery page and the activity
// editor. Each saves on its own, straight away.

/** Caption box. Saves when it loses focus, and only if the text changed. */
export function CaptionField({
  id,
  initial,
  onError,
}: {
  id: string
  initial: string
  onError: (message: string) => void
}) {
  const t = useT()
  const queryClient = useQueryClient()
  const [text, setText] = useState(initial)
  const [saved, setSaved] = useState(initial)

  async function save() {
    if (text.trim() === saved.trim()) return
    try {
      await setImageCaptionFn({ data: { id, caption: text } })
      setSaved(text)
      await queryClient.invalidateQueries({ queryKey: ['images'] })
    } catch {
      onError(t('gal.captionError'))
    }
  }

  return (
    <div className="p-2">
      <Input
        value={text}
        maxLength={200}
        aria-label={t('gal.captionLabel')}
        placeholder={t('gal.captionPlaceholder')}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => void save()}
        className="h-8 text-[13px]"
      />
    </div>
  )
}

/**
 * "Show on homepage" checkbox. `homeFull`: six are already picked, so an
 * unpicked photo cannot be added (the server refuses a seventh as well).
 */
export function HomeToggle({
  id,
  onHome,
  homeFull,
  onError,
}: {
  id: string
  onHome: boolean
  homeFull: boolean
  onError: (message: string | null) => void
}) {
  const t = useT()
  const number = useNumber()
  const queryClient = useQueryClient()
  const toggle = useMutation({
    mutationFn: (next: boolean) =>
      setImageOnHomeFn({ data: { id, onHome: next } }),
    onSuccess: async (result) => {
      onError(
        result.ok
          ? null
          : result.code === 'HOME_FULL'
            ? t('gal.homeFull', { max: number(HOME_PHOTO_COUNT) })
            : t('gal.homeError'),
      )
      await queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: () => onError(t('gal.homeError')),
  })

  return (
    <label className="flex min-h-9 items-center gap-2 px-2 pb-2 text-[13px]">
      <input
        type="checkbox"
        checked={onHome}
        disabled={toggle.isPending || (homeFull && !onHome)}
        onChange={(event) => toggle.mutate(event.target.checked)}
        className="size-4 accent-primary"
      />
      {t('gal.onHome')}
    </label>
  )
}

/** Delete button on a photo's corner. Asks first; the delete is permanent. */
export function DeletePhotoButton({
  id,
  isCover,
  onError,
}: {
  id: string
  // An activity's cover: the warning says so, and that the next photo takes over.
  isCover: boolean
  onError: (message: string | null) => void
}) {
  const t = useT()
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: () => deleteImageFn({ data: { id } }),
    onSuccess: async () => {
      onError(null)
      await queryClient.invalidateQueries({ queryKey: ['images'] })
      // It may have been a cover, which then moves to another photo.
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: () => onError(t('gal.deleteError')),
  })
  return (
    <Button
      type="button"
      variant="destructive"
      size="icon-sm"
      className="absolute end-2 top-2"
      aria-label={t('gal.deleteAria')}
      disabled={remove.isPending}
      onClick={() => {
        const question = isCover
          ? t('gal.deleteCoverConfirm')
          : t('gal.deleteConfirm')
        if (window.confirm(question)) remove.mutate()
      }}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  )
}
