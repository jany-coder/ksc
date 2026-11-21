import { useQueryClient } from '@tanstack/react-query'
import { useBlocker } from '@tanstack/react-router'
import { RotateCw, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import {
  ResizeError,
  resizeForUpload,
  uploadResized,
} from '../../lib/image-resize.ts'
import { useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { cn } from '../../lib/utils.ts'
import { Button } from '../ui/button.tsx'

// Photo uploading, shared by the gallery page and the activity editor: shrink
// in the browser, send one at a time, show each file's progress, let a failed
// one be retried, and warn before leaving the page mid-upload.

/** What went wrong, as a message key (shown in the reader's language). */
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

export type UploadItem = {
  key: number
  file: File
  status: 'waiting' | 'working' | 'done' | 'error'
  // A message key; shown in the reader's language when rendered.
  messageKey?: MessageKey | undefined
}

let nextKey = 0

/**
 * `activityId`: the activity the photos are filed under, or null for none.
 * Read at upload time, so a dropdown can change it between batches.
 */
export function usePhotoUpload(activityId: string | null) {
  const t = useT()
  const queryClient = useQueryClient()
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)

  const update = (key: number, patch: Partial<UploadItem>) =>
    setItems((list) =>
      list.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )

  // Leaving now would stop the uploads half-way: ask first. Covers links in
  // the app (shouldBlockFn) and closing or reloading the tab (beforeunload).
  useBlocker({
    shouldBlockFn: () => !window.confirm(t('gal.leaveWhileUploading')),
    enableBeforeUnload: () => busy,
    disabled: !busy,
  })

  // One photo at a time: gentler on a weak connection, and the storage check
  // on the server sees each upload in turn.
  async function run(batch: UploadItem[]) {
    setBusy(true)
    for (const item of batch) {
      update(item.key, { status: 'working', messageKey: undefined })
      try {
        const outcome = await uploadResized(
          await resizeForUpload(item.file),
          activityId,
        )
        if (outcome.ok) {
          update(item.key, { status: 'done' })
        } else {
          update(item.key, {
            status: 'error',
            messageKey: messageKeyFor(outcome.code),
          })
          // Out of space: the rest would fail the same way.
          if (outcome.code === 'STORAGE_FULL') {
            for (const rest of batch.slice(batch.indexOf(item) + 1))
              update(rest.key, { status: 'error', messageKey: 'gal.errFull' })
            break
          }
        }
      } catch (error) {
        update(item.key, {
          status: 'error',
          messageKey: messageKeyFor(
            error instanceof ResizeError ? error.code : 'FAILED',
          ),
        })
      }
    }
    setBusy(false)
    await queryClient.invalidateQueries({ queryKey: ['images'] })
    // The first photo may have become the activity's cover.
    await queryClient.invalidateQueries({ queryKey: ['activities'] })
  }

  function upload(files: FileList | File[] | null) {
    const chosen = Array.from(files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (chosen.length === 0 || busy) return
    const batch = chosen.map((file) => ({
      key: nextKey++,
      file,
      status: 'waiting' as const,
    }))
    setItems(batch)
    void run(batch)
  }

  function retry(key: number) {
    const item = items.find((i) => i.key === key)
    if (!item || busy) return
    void run([item])
  }

  return { items, busy, upload, retry }
}

/** Each file's name and state; failed ones get a retry button. */
export function UploadList({
  items,
  busy,
  onRetry,
}: {
  items: UploadItem[]
  busy: boolean
  onRetry: (key: number) => void
}) {
  const t = useT()
  if (items.length === 0) return null
  return (
    <ul
      aria-live="polite"
      className="m-0 flex list-none flex-col gap-1.5 rounded-[10px] border border-border bg-card p-4 text-sm"
    >
      {items.map((item) => (
        <li
          key={item.key}
          className="flex flex-wrap items-center gap-x-2 gap-y-1"
        >
          <span className="font-medium break-all">{item.file.name}</span>
          <span
            className={cn(
              item.status === 'error' && 'text-red-700',
              item.status === 'done' && 'text-green-700',
              (item.status === 'working' || item.status === 'waiting') &&
                'text-muted-foreground',
            )}
          >
            {item.status === 'waiting' && t('gal.waiting')}
            {item.status === 'working' && t('gal.working')}
            {item.status === 'done' && t('gal.done')}
            {item.status === 'error' && item.messageKey && t(item.messageKey)}
          </span>
          {item.status === 'error' && item.messageKey !== 'gal.errFull' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onRetry(item.key)}
            >
              <RotateCw aria-hidden="true" />
              {t('gal.retry')}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * A box to drop photos on, with a real button and file input for everyone who
 * does not drag (phones, keyboards, screen readers).
 */
export function PhotoDropZone({
  onFiles,
  disabled,
  busy,
}: {
  onFiles: (files: FileList | null) => void
  disabled: boolean
  busy: boolean
}) {
  const t = useT()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return
        e.preventDefault() // allows the drop
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        if (!disabled) onFiles(e.dataTransfer.files)
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-border bg-card px-4 py-8 text-center',
        over && 'border-primary bg-green-50',
        disabled && 'opacity-60',
      )}
    >
      <p className="m-0 text-sm text-muted-foreground">{t('gal.dropHint')}</p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = '' // allow picking the same file again
        }}
      />
      <Button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <Upload aria-hidden="true" />
        {busy ? t('gal.uploading') : t('gal.add')}
      </Button>
    </div>
  )
}
