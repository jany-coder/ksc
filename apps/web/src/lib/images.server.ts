import '@tanstack/react-start/server-only'

import { desc, eq, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { images } from '../db/schema/index.ts'
import {
  MAX_FULL_BYTES,
  MAX_THUMB_BYTES,
  STORAGE_STOP_BYTES,
  isValidDimension,
  looksLikeWebp,
  storageState,
} from './image-limits.ts'
import type { StorageState } from './image-limits.ts'
import { imagesBucket } from './r2.server.ts'

// Callers must have checked requirePermission('content.write') first
// (the upload route does; see routes/api/images.ts).

const CACHE_FOREVER = 'public, max-age=31536000, immutable'
const keyFor = (id: string, size: 'full' | 'thumb') =>
  `images/${id}/${size}.webp`

/** Bytes used by all photos (full + thumbnail), as recorded in the database. */
export async function usedBytes(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`coalesce(sum(${images.bytes}), 0)::float8` })
    .from(images)
  return row?.n ?? 0
}

export type UploadResult =
  | { ok: true; id: string }
  | {
      ok: false
      code: 'INVALID_INPUT' | 'NOT_WEBP' | 'TOO_LARGE' | 'STORAGE_FULL'
    }

export async function saveImage(
  actorId: string,
  input: {
    full: ArrayBuffer
    thumb: ArrayBuffer
    width: number
    height: number
  },
): Promise<UploadResult> {
  if (!isValidDimension(input.width) || !isValidDimension(input.height))
    return { ok: false, code: 'INVALID_INPUT' }
  if (
    input.full.byteLength > MAX_FULL_BYTES ||
    input.thumb.byteLength > MAX_THUMB_BYTES
  )
    return { ok: false, code: 'TOO_LARGE' }
  // Trust the bytes, not the browser's claim about the file type.
  if (
    !looksLikeWebp(new Uint8Array(input.full)) ||
    !looksLikeWebp(new Uint8Array(input.thumb))
  )
    return { ok: false, code: 'NOT_WEBP' }

  const bytes = input.full.byteLength + input.thumb.byteLength
  // The hard stop that keeps the club inside R2's free allowance.
  if ((await usedBytes()) + bytes > STORAGE_STOP_BYTES)
    return { ok: false, code: 'STORAGE_FULL' }

  const id = crypto.randomUUID()
  const r2Key = keyFor(id, 'full')
  const thumbR2Key = keyFor(id, 'thumb')
  const httpMetadata = {
    contentType: 'image/webp',
    cacheControl: CACHE_FOREVER,
  }
  await imagesBucket.put(r2Key, input.full, { httpMetadata })
  await imagesBucket.put(thumbR2Key, input.thumb, { httpMetadata })
  try {
    await db.insert(images).values({
      id,
      r2Key,
      thumbR2Key,
      width: input.width,
      height: input.height,
      bytes,
      uploadedBy: actorId,
    })
  } catch (error) {
    // No row means nothing would ever delete these files: remove them now.
    await imagesBucket.delete([r2Key, thumbR2Key])
    throw error
  }
  return { ok: true, id }
}

export type GalleryImage = {
  id: string
  width: number
  height: number
  caption: string | null
}
export type GalleryAdminData = {
  images: GalleryImage[]
  usedBytes: number
  state: StorageState
}

export async function listImages(limit = 200): Promise<GalleryImage[]> {
  return db
    .select({
      id: images.id,
      width: images.width,
      height: images.height,
      caption: images.caption,
    })
    .from(images)
    .orderBy(desc(images.uploadedAt))
    .limit(limit)
}

export async function galleryAdminData(): Promise<GalleryAdminData> {
  const [list, used] = await Promise.all([listImages(), usedBytes()])
  return { images: list, usedBytes: used, state: storageState(used) }
}

export type DeleteImageResult = { ok: true } | { ok: false; code: 'NOT_FOUND' }

export async function deleteImage(id: string): Promise<DeleteImageResult> {
  const [row] = await db
    .select({ r2Key: images.r2Key, thumbR2Key: images.thumbR2Key })
    .from(images)
    .where(eq(images.id, id))
    .limit(1)
  if (!row) return { ok: false, code: 'NOT_FOUND' }
  // Files first: if this fails the row stays and the delete can be retried. The
  // other way round would leave files that nothing points to and nothing removes.
  await imagesBucket.delete([row.r2Key, row.thumbR2Key])
  await db.delete(images).where(eq(images.id, id))
  return { ok: true }
}

/** The object to send for a public photo URL, or null. Does not touch the database. */
export function getImageObject(id: string, size: 'full' | 'thumb') {
  return imagesBucket.get(keyFor(id, size))
}

export const MAX_CAPTION_LENGTH = 200

export type CaptionResult = { ok: true } | { ok: false; code: 'NOT_FOUND' }

/** Set or clear (empty text) a photo's caption. Typed by an admin, shown on the public gallery. */
export async function setImageCaption(
  id: string,
  caption: string,
): Promise<CaptionResult> {
  const text = caption.trim().slice(0, MAX_CAPTION_LENGTH)
  const updated = await db
    .update(images)
    .set({ caption: text === '' ? null : text })
    .where(eq(images.id, id))
    .returning({ id: images.id })
  return updated.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
}
