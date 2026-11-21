import '@tanstack/react-start/server-only'

import { and, desc, eq, gte, inArray, isNull, lt, ne, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities, images } from '../db/schema/index.ts'
import {
  HOME_PHOTO_COUNT,
  MAX_FULL_BYTES,
  MAX_THUMB_BYTES,
  STORAGE_STOP_BYTES,
  isValidDimension,
  looksLikeWebp,
  storageState,
} from './image-limits.ts'
import type { StorageState } from './image-limits.ts'
import { imagesBucket } from './r2.server.ts'
import { listActivities } from './activities.server.ts'
import { dateRange } from './gallery-filter.ts'
import type { GalleryFilter, PublicGalleryPhoto } from './gallery-filter.ts'

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
    // The activity the photo belongs to, or null for "no activity".
    activityId: string | null
  },
): Promise<UploadResult> {
  if (!isValidDimension(input.width) || !isValidDimension(input.height))
    return { ok: false, code: 'INVALID_INPUT' }
  if (input.activityId !== null && !(await activityExists(input.activityId)))
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
      activityId: input.activityId,
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
  onHome: boolean
}

// Admins also see which activity each photo belongs to.
export type AdminGalleryImage = GalleryImage & { activityId: string | null }

// An activity a photo can be filed under, for the admin dropdowns. Drafts are
// included: photos are often added before the activity is published.
export type ActivityOption = {
  id: string
  title: string
  eventDate: string | null
}

export type GalleryAdminData = {
  images: AdminGalleryImage[]
  activities: ActivityOption[]
  // Counted over every photo, not just the filtered ones on screen.
  homeCount: number
  usedBytes: number
  state: StorageState
}

async function activityExists(id: string): Promise<boolean> {
  const [row] = await db
    .select({ id: activities.id })
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1)
  return row !== undefined
}

export async function listImages(limit = 200): Promise<GalleryImage[]> {
  return db
    .select({
      id: images.id,
      width: images.width,
      height: images.height,
      caption: images.caption,
      onHome: images.onHome,
    })
    .from(images)
    .orderBy(desc(images.uploadedAt))
    .limit(limit)
}

/**
 * The homepage photos: the ones an admin picked first, then the newest to fill
 * any empty slots. One query: sorting on_home (true before false) does both.
 */
export async function listHomeImages(): Promise<GalleryImage[]> {
  return db
    .select({
      id: images.id,
      width: images.width,
      height: images.height,
      caption: images.caption,
      onHome: images.onHome,
    })
    .from(images)
    .orderBy(desc(images.onHome), desc(images.uploadedAt))
    .limit(HOME_PHOTO_COUNT)
}

export type OnHomeResult =
  { ok: true } | { ok: false; code: 'NOT_FOUND' | 'HOME_FULL' }

/** Pick or unpick a photo for the homepage. Refuses a seventh pick. */
export async function setImageOnHome(
  id: string,
  onHome: boolean,
): Promise<OnHomeResult> {
  if (onHome) {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(images)
      .where(and(eq(images.onHome, true), ne(images.id, id)))
    if ((row?.n ?? 0) >= HOME_PHOTO_COUNT)
      return { ok: false, code: 'HOME_FULL' }
  }
  const updated = await db
    .update(images)
    .set({ onHome })
    .where(eq(images.id, id))
    .returning({ id: images.id })
  return updated.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
}

// The WHERE conditions for a filter. A year or month matches the photo's
// activity date, so photos with no activity never match one.
function filterConditions(filter: GalleryFilter): SQL[] {
  const conditions: SQL[] = []
  if (filter.activity === 'none') {
    conditions.push(isNull(images.activityId))
    return conditions
  }
  if (filter.activity) conditions.push(eq(images.activityId, filter.activity))
  const range = dateRange(filter.year, filter.month)
  if (range)
    conditions.push(
      gte(activities.eventDate, range.from),
      lt(activities.eventDate, range.to),
    )
  return conditions
}

async function listAdminImages(
  filter: GalleryFilter,
  limit = 200,
): Promise<AdminGalleryImage[]> {
  return db
    .select({
      id: images.id,
      width: images.width,
      height: images.height,
      caption: images.caption,
      onHome: images.onHome,
      activityId: images.activityId,
    })
    .from(images)
    .leftJoin(activities, eq(images.activityId, activities.id))
    .where(and(...filterConditions(filter)))
    .orderBy(desc(images.uploadedAt))
    .limit(limit)
}

async function countHomeImages(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(images)
    .where(eq(images.onHome, true))
  return row?.n ?? 0
}

export async function galleryAdminData(
  filter: GalleryFilter,
): Promise<GalleryAdminData> {
  const [list, activityRows, homeCount, used] = await Promise.all([
    listAdminImages(filter),
    listActivities(),
    countHomeImages(),
    usedBytes(),
  ])
  return {
    images: list,
    activities: activityRows.map(({ id, title, eventDate }) => ({
      id,
      title,
      eventDate,
    })),
    homeCount,
    usedBytes: used,
    state: storageState(used),
  }
}

export type SetActivityResult =
  { ok: true; updated: number } | { ok: false; code: 'NOT_FOUND' }

/** File one or more photos under an activity, or under none (null). */
export async function setImagesActivity(
  ids: string[],
  activityId: string | null,
): Promise<SetActivityResult> {
  if (activityId !== null && !(await activityExists(activityId)))
    return { ok: false, code: 'NOT_FOUND' }
  const updated = await db
    .update(images)
    .set({ activityId })
    .where(inArray(images.id, ids))
    .returning({ id: images.id })
  return { ok: true, updated: updated.length }
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

// --- Public gallery: anyone can call this, so it returns the bare minimum ---

// The activity's columns only when it is published; a draft looks like "no
// activity", so its title never reaches the public.
const isPublished = sql`${activities.status} = 'published'`
const publicActivityId = sql<
  string | null
>`case when ${isPublished} then ${activities.id} end`
const publicActivityDate = sql<
  string | null
>`case when ${isPublished} then ${activities.eventDate}::text end`

export type PublicGalleryPage = {
  photos: PublicGalleryPhoto[]
  // True when there are more photos after this page.
  hasMore: boolean
}

/**
 * One page of the public gallery, newest activity first. Within an activity,
 * newest upload first; photos with no published activity come last. The
 * activity id is a sort key too, so one activity's photos stay together even
 * when two activities share a date (or have none).
 */
export async function listPublicGallery(input: {
  year: number | undefined
  limit: number
  offset: number
}): Promise<PublicGalleryPage> {
  const range = dateRange(input.year, undefined)
  const rows = await db
    .select({
      id: images.id,
      width: images.width,
      height: images.height,
      caption: images.caption,
      activityId: publicActivityId,
      activityTitle: sql<
        string | null
      >`case when ${isPublished} then ${activities.title} end`,
      activityDate: publicActivityDate,
    })
    .from(images)
    .leftJoin(activities, eq(images.activityId, activities.id))
    .where(
      range
        ? and(
            isPublished,
            gte(activities.eventDate, range.from),
            lt(activities.eventDate, range.to),
          )
        : undefined,
    )
    .orderBy(
      sql`${publicActivityDate} desc nulls last`,
      sql`${publicActivityId} nulls last`,
      desc(images.uploadedAt),
      // Last tie-break, so pages never overlap or skip a photo.
      desc(images.id),
    )
    .limit(input.limit + 1)
    .offset(input.offset)
  return {
    photos: rows.slice(0, input.limit),
    hasMore: rows.length > input.limit,
  }
}

/** The years that have published activities with photos, newest first. */
export async function publicGalleryYears(): Promise<number[]> {
  const rows = await db
    .selectDistinct({
      year: sql<number>`extract(year from ${activities.eventDate})::int`,
    })
    .from(images)
    .innerJoin(activities, eq(images.activityId, activities.id))
    .where(and(isPublished, sql`${activities.eventDate} is not null`))
  return rows.map((r) => r.year).sort((a, b) => b - a)
}
