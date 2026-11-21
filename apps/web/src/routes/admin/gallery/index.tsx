import {
  infiniteQueryOptions,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { NativeSelect } from '../../../components/ui/native-select.tsx'
import {
  GalleryFilters,
  activityLabel,
} from '../../../components/admin/gallery-filters.tsx'
import { galleryFilterSchema } from '../../../lib/gallery-filter.ts'
import type { GalleryFilter } from '../../../lib/gallery-filter.ts'
import {
  deleteImageFn,
  setImageCaptionFn,
  setImageOnHomeFn,
  setImagesActivityFn,
  galleryAdminDataFn,
} from '../../../lib/images.functions.ts'
import {
  HOME_PHOTO_COUNT,
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
import { useLang, useNumber, useT } from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import type { ActivityOption } from '../../../lib/images.server.ts'
import { can } from '../../../lib/permissions.ts'
import { cn } from '../../../lib/utils.ts'

// The filter is part of the cache key, so each filtered view is cached on its
// own, and ['images'] still clears them all after a change.
const galleryQuery = (filter: GalleryFilter) =>
  infiniteQueryOptions({
    queryKey: ['images', 'admin', filter],
    // An "infinite" query keeps a list of pages; "Show more" fetches the next.
    // pageParam is the offset: how many photos are already on screen.
    queryFn: ({ pageParam }) =>
      galleryAdminDataFn({ data: { ...filter, offset: pageParam } }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      last.hasMore
        ? pages.reduce((n, page) => n + page.images.length, 0)
        : undefined,
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
  // validateSearch reads ?year=&month=&activity= from the URL; loaderDeps
  // tells the loader to run again whenever they change.
  validateSearch: galleryFilterSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData(galleryQuery(deps)),
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

function ActivityOptions({ activities }: { activities: ActivityOption[] }) {
  const t = useT()
  const lang = useLang()
  return (
    <>
      <option value="">{t('gal.noActivity')}</option>
      {activities.map((activity) => (
        <option key={activity.id} value={activity.id}>
          {activityLabel(activity, lang)}
        </option>
      ))}
    </>
  )
}

function GalleryPage() {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const filter = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const gallery = useSuspenseInfiniteQuery(galleryQuery(filter))
  // Storage, counts and activities come with every page; read them from the
  // first. The photos are every loaded page joined together.
  const first = gallery.data.pages[0]!
  const data = {
    ...first,
    images: gallery.data.pages.flatMap((page) => page.images),
  }
  const queryClient = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // The activity new uploads are filed under; '' means none.
  const [uploadActivity, setUploadActivity] = useState('')
  // Photos ticked for a bulk move. Cleared when the filter changes.
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkActivity, setBulkActivity] = useState('')

  const setFilter = (next: GalleryFilter) => {
    setSelected(new Set())
    void navigate({ search: next })
  }
  const toggleSelected = (id: string, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  const anyFilter =
    filter.year !== undefined ||
    filter.month !== undefined ||
    filter.activity !== undefined

  const full = data.state === 'full'
  const homeCount = data.homeCount
  const homeFull = homeCount >= HOME_PHOTO_COUNT
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
        const outcome = await uploadResized(
          await resizeForUpload(file),
          uploadActivity || null,
        )
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

  const moveToActivity = useMutation({
    mutationFn: (choice: { ids: string[]; activityId: string | null }) =>
      setImagesActivityFn({ data: choice }),
    onSuccess: async (result) => {
      setDeleteError(result.ok ? null : t('gal.activityError'))
      if (result.ok) setSelected(new Set())
      await queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: () => setDeleteError(t('gal.activityError')),
  })

  const toggleHome = useMutation({
    mutationFn: (choice: { id: string; onHome: boolean }) =>
      setImageOnHomeFn({ data: choice }),
    onSuccess: async (result) => {
      setDeleteError(
        result.ok
          ? null
          : result.code === 'HOME_FULL'
            ? t('gal.homeFull', { max: number(HOME_PHOTO_COUNT) })
            : t('gal.homeError'),
      )
      await queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: () => setDeleteError(t('gal.homeError')),
  })

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">{t('gal.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('gal.lead')}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[220px] flex-col gap-1">
            <label htmlFor="upload-activity" className="text-sm font-medium">
              {t('gal.uploadActivity')}
            </label>
            <NativeSelect
              id="upload-activity"
              value={uploadActivity}
              disabled={busy}
              onChange={(event) => setUploadActivity(event.target.value)}
            >
              <ActivityOptions activities={data.activities} />
            </NativeSelect>
          </div>
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

      <GalleryFilters
        filter={filter}
        activities={data.activities}
        onChange={setFilter}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <p role="status">
          {t('gal.resultCount', { n: number(data.total) })}{' '}
          {t('gal.homeCount', {
            n: number(homeCount),
            max: number(HOME_PHOTO_COUNT),
          })}
        </p>
        {data.images.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSelected(
                selected.size === data.images.length
                  ? new Set()
                  : new Set(data.images.map((image) => image.id)),
              )
            }
          >
            {selected.size === data.images.length
              ? t('gal.selectNone')
              : t('gal.selectAll')}
          </Button>
        )}
      </div>

      {/* Appears once a photo is ticked: move the whole selection at once. */}
      {selected.size > 0 && (
        <section
          aria-label={t('gal.bulkLabel')}
          className="sticky top-2 z-10 flex flex-wrap items-end gap-3 rounded-[10px] border border-border bg-card p-3 shadow-sm"
        >
          <p className="w-full text-sm font-medium sm:w-auto sm:self-center">
            {t('gal.selectedCount', { n: number(selected.size) })}
          </p>
          <div className="flex w-full min-w-0 flex-col gap-1 sm:w-72">
            <label htmlFor="bulk-activity" className="text-sm font-medium">
              {t('gal.bulkMoveTo')}
            </label>
            <NativeSelect
              id="bulk-activity"
              value={bulkActivity}
              onChange={(event) => setBulkActivity(event.target.value)}
            >
              <ActivityOptions activities={data.activities} />
            </NativeSelect>
          </div>
          <Button
            type="button"
            disabled={moveToActivity.isPending}
            onClick={() =>
              moveToActivity.mutate({
                ids: [...selected],
                activityId: bulkActivity || null,
              })
            }
          >
            {t('gal.bulkMove')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            {t('gal.selectNone')}
          </Button>
        </section>
      )}

      {data.images.length > 0 ? (
        <>
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
                {/* Tick for a bulk move. The label is for screen readers; the
                  box sits on the photo's corner. */}
                <label className="absolute start-2 top-2 flex size-8 items-center justify-center rounded-md bg-card/90">
                  <input
                    type="checkbox"
                    checked={selected.has(image.id)}
                    onChange={(event) =>
                      toggleSelected(image.id, event.target.checked)
                    }
                    className="size-4 accent-primary"
                  />
                  <span className="sr-only">{t('gal.selectPhoto')}</span>
                </label>
                <CaptionField
                  id={image.id}
                  initial={image.caption ?? ''}
                  onError={() => setDeleteError(t('gal.captionError'))}
                />
                <div className="px-2 pb-2">
                  <NativeSelect
                    aria-label={t('gal.photoActivity')}
                    value={image.activityId ?? ''}
                    disabled={moveToActivity.isPending}
                    onChange={(event) =>
                      moveToActivity.mutate({
                        ids: [image.id],
                        activityId: event.target.value || null,
                      })
                    }
                    className="h-8 text-[13px] md:text-[13px]"
                  >
                    <ActivityOptions activities={data.activities} />
                  </NativeSelect>
                </div>
                <label className="flex min-h-9 items-center gap-2 px-2 pb-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={image.onHome}
                    // A seventh pick is refused: unpick one first.
                    disabled={
                      toggleHome.isPending || (homeFull && !image.onHome)
                    }
                    onChange={(event) =>
                      toggleHome.mutate({
                        id: image.id,
                        onHome: event.target.checked,
                      })
                    }
                    className="size-4 accent-primary"
                  />
                  {t('gal.onHome')}
                </label>
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
          {gallery.hasNextPage && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={gallery.isFetchingNextPage}
                onClick={() => void gallery.fetchNextPage()}
              >
                {gallery.isFetchingNextPage
                  ? t('gal.loadingMore')
                  : t('gal.showMore')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-[10px] border border-border bg-card px-4 py-10 text-center text-muted-foreground">
          {anyFilter ? t('gal.emptyFiltered') : t('gal.empty')}
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
