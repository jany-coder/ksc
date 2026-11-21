import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { ResizeError, resizeMemberPhoto } from '../../lib/image-resize.ts'
import { useT } from '../../lib/i18n/index.tsx'
import { cn } from '../../lib/utils.ts'
import { Button } from '../ui/button.tsx'

// A member's photo: admins only, served by /api/member-photo/<id>, which
// checks the session on every request.

/** The photo, or the first letter of the name in a circle when there is none. */
export function MemberAvatar({
  photoUrl,
  name,
  className,
}: {
  photoUrl: string | null
  name: string
  className?: string
}) {
  const t = useT()
  return photoUrl ? (
    <img
      src={photoUrl}
      alt={t('memberPhoto.alt', { name })}
      className={cn('shrink-0 rounded-lg bg-secondary object-cover', className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-secondary font-semibold text-muted-foreground',
        className,
      )}
    >
      {Array.from(name.trim())[0] ?? ''}
    </span>
  )
}

/**
 * Add, replace or remove a member's photo. Saves at once (it is not part of
 * the details form). The photo is shrunk in the browser to one small WebP
 * before it is sent.
 */
export function MemberPhotoEditor({
  memberId,
  name,
  photoUrl,
  onChanged,
}: {
  memberId: string
  name: string
  photoUrl: string | null
  onChanged: () => Promise<void>
}) {
  const t = useT()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const photo = await resizeMemberPhoto(file)
      const form = new FormData()
      form.set('photo', photo.blob, 'photo.webp')
      form.set('width', String(photo.width))
      form.set('height', String(photo.height))
      const response = await fetch(`/api/member-photo/${memberId}`, {
        method: 'POST',
        body: form,
      })
      if (!response.ok) throw new Error('upload failed')
      await onChanged()
    } catch (e) {
      setError(
        e instanceof ResizeError && e.code === 'UNREADABLE'
          ? t('gal.errUnreadable')
          : t('memberPhoto.error'),
      )
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  async function remove() {
    if (!window.confirm(t('memberPhoto.removeConfirm'))) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/member-photo/${memberId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('delete failed')
      await onChanged()
    } catch {
      setError(t('memberPhoto.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      aria-labelledby="member-photo-title"
      className="mt-5 flex max-w-2xl flex-wrap items-center gap-4 rounded-[10px] border border-border bg-card p-5"
    >
      <MemberAvatar
        photoUrl={photoUrl}
        name={name}
        className="size-24 text-3xl"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <h2 id="member-photo-title" className="text-[15px] font-semibold">
          {t('memberPhoto.title')}
        </h2>
        <p className="text-[13px] text-muted-foreground">
          {t('memberPhoto.note')}
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <Camera aria-hidden="true" />
            {busy
              ? t('a.wait')
              : photoUrl
                ? t('memberPhoto.replace')
                : t('memberPhoto.add')}
          </Button>
          {photoUrl && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void remove()}
            >
              <Trash2 aria-hidden="true" />
              {t('memberPhoto.remove')}
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}
