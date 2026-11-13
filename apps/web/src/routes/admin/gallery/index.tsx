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
import {
  deleteImageFn,
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
import { can } from '../../../lib/permissions.ts'
import { cn } from '../../../lib/utils.ts'

const galleryQuery = () =>
  queryOptions({
    queryKey: ['images', 'admin'],
    queryFn: () => galleryAdminDataFn(),
  })

export const Route = createFileRoute('/admin/gallery/')({
  head: () => ({ meta: [{ title: 'গ্যালারি — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // Keeps people off the page; the server checks the permission too.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery()),
  errorComponent: () => (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        গ্যালারি লোড করা গেল না। পাতাটি রিফ্রেশ করে দেখুন।
      </p>
    </main>
  ),
  component: GalleryPage,
})

// What went wrong, in words for the person uploading.
function messageFor(code: string): string {
  switch (code) {
    case 'UNREADABLE':
      return 'ছবিটি খোলা গেল না (হয়তো এই ধরনের ফাইল সমর্থিত নয়)।'
    case 'WEBP_UNSUPPORTED':
      return 'এই ব্রাউজারে ছবি ছোট করা যায় না। Chrome বা Edge ব্যবহার করুন।'
    case 'TOO_BIG':
    case 'TOO_LARGE':
      return 'ছবিটি অনেক বড়, ছোট করেও সীমার মধ্যে আনা গেল না।'
    case 'STORAGE_FULL':
      return 'ছবি রাখার জায়গা প্রায় শেষ, নতুন ছবি নেওয়া বন্ধ আছে।'
    case 'UNAUTHENTICATED':
    case 'FORBIDDEN':
      return 'ছবি দেওয়ার অনুমতি নেই। আবার লগইন করুন।'
    default:
      return 'আপলোড হলো না। ইন্টারনেট দেখে আবার চেষ্টা করুন।'
  }
}

type UploadItem = {
  key: number
  name: string
  status: 'working' | 'done' | 'error'
  message?: string
}

function GalleryPage() {
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
          update(key, { status: 'error', message: messageFor(outcome.code) })
          // Out of space: the rest would fail the same way.
          if (outcome.code === 'STORAGE_FULL') break
        }
      } catch (error) {
        update(key, {
          status: 'error',
          message: messageFor(
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
    onError: () => setDeleteError('ছবিটি মোছা গেল না। আবার চেষ্টা করুন।'),
  })

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">গ্যালারি</h1>
          <p className="text-sm text-muted-foreground">
            এখানে দেওয়া সব ছবি ওয়েবসাইটের গ্যালারিতে দেখা যায়। ছবি আপলোডের আগে
            নিজে থেকেই ছোট হয়ে যায়।
          </p>
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
            {busy ? 'আপলোড হচ্ছে…' : 'ছবি যোগ করুন'}
          </Button>
        </div>
      </div>

      {/* Storage meter: R2 is free up to 10 GB; we warn at 6 GB and refuse at 8 GB. */}
      <section
        aria-label="ছবি রাখার জায়গা"
        className="rounded-[10px] border border-border bg-card p-4"
      >
        <p className="mb-2 text-sm">
          ব্যবহৃত: <strong>{formatBytes(data.usedBytes)}</strong>{' '}
          <span className="text-muted-foreground">
            / {formatBytes(STORAGE_FREE_BYTES)} (বিনামূল্যের সীমা)
          </span>
        </p>
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={STORAGE_FREE_BYTES}
          aria-valuenow={Math.round(data.usedBytes)}
          aria-label="ব্যবহৃত জায়গা"
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
            জায়গা কমে আসছে ({formatBytes(STORAGE_WARN_BYTES)} পার হয়েছে)।{' '}
            {formatBytes(STORAGE_STOP_BYTES)}-তে নতুন ছবি নেওয়া বন্ধ হয়ে যাবে।
            পুরনো অপ্রয়োজনীয় ছবি মুছে দিন।
          </p>
        )}
        {full && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            জায়গা প্রায় শেষ। নতুন ছবি নেওয়া বন্ধ। পুরনো ছবি মুছে জায়গা করুন।
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
                {item.status === 'working' && 'প্রক্রিয়া চলছে…'}
                {item.status === 'done' && 'হয়েছে'}
                {item.status === 'error' && item.message}
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
                alt="ক্লাবের ছবি"
                className="aspect-square w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute end-2 top-2"
                aria-label="ছবিটি মুছুন"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm('ছবিটি স্থায়ীভাবে মুছে ফেলবেন?'))
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
          এখনো কোনো ছবি যোগ হয়নি।
        </p>
      )}
    </main>
  )
}
