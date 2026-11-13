import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { Input } from '../../../components/ui/input.tsx'
import {
  deleteImageFn,
  setImageCaptionFn,
  galleryAdminDataFn,
} from '../../../lib/images.functions.ts'
import {
  STORAGE_FREE_BYTES,
  STORAGE_STOP_BYTES,
  STORAGE_WARN_BYTES,
  formatBytes,
  imageUrl,
} from '../../../lib/image-limits.ts'
import {
  ResizeError,
  resizeForUpload,
  uploadResized,
} from '../../../lib/image-resize.ts'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { useLang, useT } from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'
import { cn } from '../../../lib/utils.ts'

const galleryQuery = () =>
  queryOptions({
    queryKey: ['images', 'admin'],
    queryFn: () => galleryAdminDataFn(),
  })

export const Route = createFileRoute('/admin/gallery/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('gal.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // Keeps people off the page; the server checks the permission too.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery()),
  errorComponent: GalleryError,
  component: GalleryPage,
})

function GalleryError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('gal.loadError')}
      </p>
    </main>
  )
}

// What went wrong, as a message key (shown in the reader's language).
function messageKeyFor(code: string): MessageKey {
  switch (code) {
    case 'UNREADABLE':
      return 'gal.errUnreadable'
    case 'WEBP_UNSUPPORTED':
      return 'gal.errWebp'
    case 'TOO_BIG':
    case 'TOO_LARGE':
      return 'gal.errTooBig'
    case 'STORAGE_FULL':
      return 'gal.errFull'
    case 'UNAUTHENTICATED':
    case 'FORBIDDEN':
      return 'gal.errAuth'
    default:
      return 'gal.errGeneric'
  }
}

type UploadItem = {
  key: number
  name: string
  status: 'working' | 'done' | 'error'
  // A message key; shown in the reader's language when rendered.
  messageKey?: MessageKey
}

function GalleryPage() {
  const t = useT()
  const lang = useLang()
  const { data } = useSuspenseQuery(galleryQuery())
  const queryClient = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const full = data.state === 'full'
  const percent = Math.min(100, (data.usedBytes / STORAGE_FREE_BYTES) * 100)

  const update = (key: number, patch: Partial<UploadItem>) =>
    setItems((list) =>
      list.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )

  // One photo at a time: gentler on a weak connection, and the storage check on
  // the server sees each upload in turn.
  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const chosen = Array.from(files)
    const base = Date.now()
    setItems(
      chosen.map((file, i) => ({
        key: base + i,
        name: file.name,
        status: 'working' as const,
      })),
    )
    setBusy(true)
    for (const [i, file] of chosen.entries()) {
      const key = base + i
      try {
        const outcome = await uploadResized(await resizeForUpload(file))
        if (outcome.ok) {
          update(key, { status: 'done' })
        } else {
          update(key, {
            status: 'error',
            messageKey: messageKeyFor(outcome.code),
          })
          // Out of space: the rest would fail the same way.
          if (outcome.code === 'STORAGE_FULL') break
        }
      } catch (error) {
        update(key, {
          status: 'error',
          messageKey: messageKeyFor(
            error instanceof ResizeError ? error.code : 'FAILED',
          ),
        })
      }
    }
    setBusy(false)
    if (input.current) input.current.value = '' // allow picking the same file again
    await queryClient.invalidateQueries({ queryKey: ['images'] })
  }

  const remove = useMutation({
    mutationFn: (id: string) => deleteImageFn({ data: { id } }),
    onSuccess: async () => {
      setDeleteError(null)
      await queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: () => setDeleteError(t('gal.deleteError')),
  })

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">{t('gal.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('gal.lead')}</p>
        </div>
        <div>
          <input
            ref={input}
            id="photos"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy || full}
            onChange={(e) => void onFiles(e.target.files)}
          />
          <Button
            type="button"
            disabled={busy || full}
            onClick={() => input.current?.click()}
          >
            <Upload aria-hidden="true" />
            {busy ? t('gal.uploading') : t('gal.add')}
          </Button>
        </div>
      </div>

      {/* Storage meter: R2 is free up to 10 GB; we warn at 6 GB and refuse at 8 GB. */}
      <section
        aria-label={t('gal.storage')}
        className="rounded-[10px] border border-border bg-card p-4"
      >
        <p className="mb-2 text-sm">
          {t('gal.used', {
            used: formatBytes(data.usedBytes, lang),
            free: formatBytes(STORAGE_FREE_BYTES, lang),
          })}
        </p>
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={STORAGE_FREE_BYTES}
          aria-valuenow={Math.round(data.usedBytes)}
          aria-label={t('gal.meter')}
          className="h-2 overflow-hidden rounded-full bg-secondary"
        >
          <div
            className={cn(
              'h-full',
              data.state === 'ok' && 'bg-primary',
              data.state === 'warn' && 'bg-yellow-600',
              data.state === 'full' && 'bg-red-600',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        {data.state === 'warn' && (
          <p role="status" className="mt-2 text-sm text-yellow-800">
            {t('gal.warn', {
              warn: formatBytes(STORAGE_WARN_BYTES, lang),
              stop: formatBytes(STORAGE_STOP_BYTES, lang),
            })}
          </p>
        )}
        {full && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {t('gal.full')}
          </p>
        )}
      </section>

      {items.length > 0 && (
        <ul
          aria-live="polite"
          className="m-0 flex list-none flex-col gap-1 rounded-[10px] border border-border bg-card p-4 text-sm"
        >
          {items.map((item) => (
            <li key={item.key} className="flex flex-wrap gap-x-2">
              <span className="font-medium break-all">{item.name}</span>
              <span
                className={cn(
                  item.status === 'error' && 'text-red-700',
                  item.status === 'done' && 'text-green-700',
                  item.status === 'working' && 'text-muted-foreground',
                )}
              >
                {item.status === 'working' && t('gal.working')}
                {item.status === 'done' && t('gal.done')}
                {item.status === 'error' &&
                  item.messageKey &&
                  t(item.messageKey)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {deleteError && (
        <p role="alert" className="text-sm text-red-700">
          {deleteError}
        </p>
      )}

      {data.images.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 p-0">
          {data.images.map((image) => (
            <li
              key={image.id}
              className="relative overflow-hidden rounded-[10px] border border-border bg-card"
            >
              <img
                src={imageUrl(image.id, 'thumb')}
                width={image.width}
                height={image.height}
                loading="lazy"
                alt={t('gal.photoAlt')}
                className="aspect-square w-full object-cover"
              />
              <CaptionField
                id={image.id}
                initial={image.caption ?? ''}
                onError={() => setDeleteError(t('gal.captionError'))}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute end-2 top-2"
                aria-label={t('gal.deleteAria')}
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm(t('gal.deleteConfirm')))
                    remove.mutate(image.id)
                }}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[10px] border border-border bg-card px-4 py-10 text-center text-muted-foreground">
          {t('gal.empty')}
        </p>
      )}
    </main>
  )
}

// Saves when the box loses focus, and only if the text changed.
function CaptionField({
  id,
  initial,
  onError,
}: {
  id: string
  initial: string
  onError: () => void
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
      onError()
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
