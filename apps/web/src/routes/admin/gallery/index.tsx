import {
  infiniteQueryOptions,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { NativeSelect } from '../../../components/ui/native-select.tsx'
import {
  CaptionField,
  DeletePhotoButton,
  HomeToggle,
} from '../../../components/admin/photo-controls.tsx'
import {
  PhotoDropZone,
  UploadList,
  usePhotoUpload,
} from '../../../components/admin/photo-upload.tsx'
import {
  GalleryFilters,
  activityLabel,
} from '../../../components/admin/gallery-filters.tsx'
import { galleryFilterSchema } from '../../../lib/gallery-filter.ts'
import type { GalleryFilter } from '../../../lib/gallery-filter.ts'
import {
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
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { useLang, useNumber, useT } from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
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
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // The activity new uploads are filed under; '' means none.
  const [uploadActivity, setUploadActivity] = useState('')
  const { items, busy, upload, retry } = usePhotoUpload(uploadActivity || null)
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
        </div>
      </div>

      <PhotoDropZone onFiles={upload} disabled={busy || full} busy={busy} />

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

      <UploadList items={items} busy={busy} onRetry={retry} />

      {deleteError && (
        <p role="alert" className="text-sm text-red-700">
          {deleteError}
        </p>
      )}

      {/* Photos still to sort, unless that is the view already open. */}
      {data.unfiledCount > 0 && filter.activity !== 'none' && (
        <section
          aria-label={t('gal.unfiledLabel')}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900"
        >
          <p className="m-0">
            {t('gal.unfiled', { n: number(data.unfiledCount) })}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFilter({ activity: 'none' })}
          >
            {t('gal.unfiledShow')}
          </Button>
        </section>
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
                  onError={setDeleteError}
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
                  {image.activityId && (
                    <Link
                      to="/admin/activities/$id"
                      params={{ id: image.activityId }}
                      className="mt-1 inline-block text-[13px] text-primary hover:underline"
                    >
                      {t('gal.openActivity')}
                    </Link>
                  )}
                </div>
                <HomeToggle
                  id={image.id}
                  onHome={image.onHome}
                  homeFull={homeFull}
                  onError={setDeleteError}
                />
                <DeletePhotoButton
                  id={image.id}
                  isCover={image.isCover}
                  onError={setDeleteError}
                />
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
