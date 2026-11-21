import '@tanstack/react-start/server-only'

import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  ne,
  sql,
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities, images } from '../db/schema/index.ts'
import {
  HERO_SLIDE_COUNT,
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
import { activityChoices } from './activities.server.ts'
import { heroSwitches } from './site-settings.server.ts'
import type { HeroSwitches } from './site-settings.server.ts'
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
  // The first photo of an activity with no cover becomes its cover, so nobody
  // has to remember to pick one. "is null" in the WHERE makes this a no-op
  // once a cover exists, even when two uploads finish at the same moment.
  if (input.activityId !== null)
    await db
      .update(activities)
      .set({ coverImageId: id })
      .where(
        and(
          eq(activities.id, input.activityId),
          isNull(activities.coverImageId),
        ),
      )
  return { ok: true, id }
}

export type GalleryImage = {
  id: string
  width: number
  height: number
  caption: string | null
  onHome: boolean
}

// Admins also see which activity each photo belongs to, and whether some
// activity uses it as its cover (deleting it then needs a clearer warning).
export type AdminGalleryImage = GalleryImage & {
  activityId: string | null
  isCover: boolean
}

const isCoverSql = sql<boolean>`exists (select 1 from ${activities} where ${activities.coverImageId} = ${images.id})`

// An activity a photo can be filed under, for the admin dropdowns. Drafts are
// included: photos are often added before the activity is published.
export type ActivityOption = {
  id: string
  title: string
  eventDate: string | null
}

export type GalleryAdminData = {
  images: AdminGalleryImage[]
  // True when there are more photos after this page.
  hasMore: boolean
  // How many photos match the filter in all, across every page.
  total: number
  // Photos not filed under any activity: the ones still to sort.
  unfiledCount: number
  activities: ActivityOption[]
  // Counted over every photo, not just the filtered ones on screen.
  homeCount: number
  // What is picked for the hero, and whether each part is switched on.
  hero: HeroPhotos
  heroSwitches: HeroSwitches
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
  limit: number,
  offset: number,
): Promise<AdminGalleryImage[]> {
  return (
    db
      .select({
        id: images.id,
        width: images.width,
        height: images.height,
        caption: images.caption,
        onHome: images.onHome,
        activityId: images.activityId,
        isCover: isCoverSql,
      })
      .from(images)
      .leftJoin(activities, eq(images.activityId, activities.id))
      .where(and(...filterConditions(filter)))
      // id breaks ties, so pages never overlap or skip a photo.
      .orderBy(desc(images.uploadedAt), desc(images.id))
      .limit(limit)
      .offset(offset)
  )
}

async function countAdminImages(filter: GalleryFilter): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(images)
    .leftJoin(activities, eq(images.activityId, activities.id))
    .where(and(...filterConditions(filter)))
  return row?.n ?? 0
}

async function countHomeImages(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(images)
    .where(eq(images.onHome, true))
  return row?.n ?? 0
}

export const ADMIN_GALLERY_PAGE = 100

export async function galleryAdminData(
  filter: GalleryFilter,
  offset: number,
): Promise<GalleryAdminData> {
  const [
    list,
    total,
    unfiledCount,
    activityRows,
    homeCount,
    hero,
    switches,
    used,
  ] = await Promise.all([
    // One extra row tells whether another page exists.
    listAdminImages(filter, ADMIN_GALLERY_PAGE + 1, offset),
    countAdminImages(filter),
    countAdminImages({ activity: 'none' }),
    activityChoices(),
    countHomeImages(),
    pickedHeroPhotos(),
    heroSwitches(),
    usedBytes(),
  ])
  return {
    images: list.slice(0, ADMIN_GALLERY_PAGE),
    hasMore: list.length > ADMIN_GALLERY_PAGE,
    total,
    unfiledCount,
    activities: activityRows,
    homeCount,
    hero,
    heroSwitches: switches,
    usedBytes: used,
    state: storageState(used),
  }
}

// --- the hero at the top of the homepage ---

export type HeroPhotos = {
  background: GalleryImage | null
  slides: GalleryImage[]
}

/** The photos an admin picked for the hero, slides in their order. */
async function pickedHeroPhotos(): Promise<HeroPhotos> {
  const rows = await db
    .select({
      id: images.id,
      width: images.width,
      height: images.height,
      caption: images.caption,
      onHome: images.onHome,
      heroOrder: images.heroOrder,
      heroBackground: images.heroBackground,
    })
    .from(images)
    .where(sql`${images.heroBackground} or ${images.heroOrder} is not null`)
    .orderBy(asc(images.heroOrder))
  const plain = ({
    heroOrder: _order,
    heroBackground: _background,
    ...photo
  }: (typeof rows)[number]): GalleryImage => photo
  const background = rows.find((r) => r.heroBackground)
  return {
    background: background ? plain(background) : null,
    slides: rows.filter((r) => r.heroOrder !== null).map(plain),
  }
}

/**
 * The hero for the homepage: exactly what an admin picked, nothing filled in,
 * and only the parts switched on. With no background the hero is plain deep
 * green; with no frame photos it shows the club's areas of work instead (see
 * components/public/home/hero.tsx).
 */
export async function heroPhotos(): Promise<HeroPhotos> {
  const [picked, on] = await Promise.all([pickedHeroPhotos(), heroSwitches()])
  return {
    background: on.background ? picked.background : null,
    slides: on.frame ? picked.slides : [],
  }
}

export type SetHeroResult =
  { ok: true } | { ok: false; code: 'INVALID_INPUT' | 'NOT_FOUND' }

/**
 * Save the whole hero at once: the background (or none) and the frame's
 * photos in order. Saving the whole list keeps it simple to add, remove and
 * reorder, and the batch runs as one transaction, so it never half-saves.
 */
export async function setHeroPhotos(input: {
  backgroundId: string | null
  slideIds: string[]
}): Promise<SetHeroResult> {
  const { backgroundId, slideIds } = input
  if (
    slideIds.length > HERO_SLIDE_COUNT ||
    new Set(slideIds).size !== slideIds.length
  )
    return { ok: false, code: 'INVALID_INPUT' }
  const ids = [
    ...new Set([...slideIds, ...(backgroundId ? [backgroundId] : [])]),
  ]
  if (ids.length > 0) {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(images)
      .where(inArray(images.id, ids))
    if ((row?.n ?? 0) !== ids.length) return { ok: false, code: 'NOT_FOUND' }
  }
  await db.batch([
    // Clear first, so the unique indexes never see two photos in one place.
    db
      .update(images)
      .set({ heroOrder: null, heroBackground: false })
      .where(sql`${images.heroBackground} or ${images.heroOrder} is not null`),
    ...slideIds.map((id, i) =>
      db
        .update(images)
        .set({ heroOrder: i + 1 })
        .where(eq(images.id, id)),
    ),
    ...(backgroundId
      ? [
          db
            .update(images)
            .set({ heroBackground: true })
            .where(eq(images.id, backgroundId)),
        ]
      : []),
  ])
  return { ok: true }
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
  // Activities using this photo as their cover, to give them another one.
  const coverOf = await db
    .select({ id: activities.id })
    .from(activities)
    .where(eq(activities.coverImageId, id))
  // Files first: if this fails the row stays and the delete can be retried. The
  // other way round would leave files that nothing points to and nothing removes.
  await imagesBucket.delete([row.r2Key, row.thumbR2Key])
  // The database clears the cover itself (on delete set null).
  await db.delete(images).where(eq(images.id, id))
  // The activity's oldest remaining photo becomes the cover, if it has one.
  for (const activity of coverOf) {
    const [next] = await db
      .select({ id: images.id })
      .from(images)
      .where(eq(images.activityId, activity.id))
      .orderBy(asc(images.uploadedAt), asc(images.id))
      .limit(1)
    if (next)
      await db
        .update(activities)
        .set({ coverImageId: next.id })
        .where(
          and(eq(activities.id, activity.id), isNull(activities.coverImageId)),
        )
  }
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
      activitySlug: sql<
        string | null
      >`case when ${isPublished} then ${activities.slug} end`,
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

// --- One activity's photos, for the admin activity editor ---

export type ActivityPhotosData = {
  photos: AdminGalleryImage[]
  coverImageId: string | null
  // For the "view page" link; the page exists only once published.
  slug: string
  published: boolean
  homeCount: number
  state: StorageState
}

/** The activity's photos in upload order, its cover and what the editor needs. Null if it is gone. */
export async function activityPhotos(
  activityId: string,
): Promise<ActivityPhotosData | null> {
  const [activity] = await db
    .select({
      coverImageId: activities.coverImageId,
      slug: activities.slug,
      status: activities.status,
    })
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)
  if (!activity) return null
  const [photos, homeCount, used] = await Promise.all([
    db
      .select({
        id: images.id,
        width: images.width,
        height: images.height,
        caption: images.caption,
        onHome: images.onHome,
        activityId: images.activityId,
        isCover: isCoverSql,
      })
      .from(images)
      .where(eq(images.activityId, activityId))
      .orderBy(asc(images.uploadedAt), asc(images.id)),
    countHomeImages(),
    usedBytes(),
  ])
  return {
    photos,
    coverImageId: activity.coverImageId,
    slug: activity.slug,
    published: activity.status === 'published',
    homeCount,
    state: storageState(used),
  }
}

export type SetCoverResult = { ok: true } | { ok: false; code: 'NOT_FOUND' }

/** Make one of the activity's own photos its cover. */
export async function setActivityCover(
  activityId: string,
  imageId: string,
): Promise<SetCoverResult> {
  const [own] = await db
    .select({ id: images.id })
    .from(images)
    .where(and(eq(images.id, imageId), eq(images.activityId, activityId)))
    .limit(1)
  if (!own) return { ok: false, code: 'NOT_FOUND' }
  await db
    .update(activities)
    .set({ coverImageId: imageId })
    .where(eq(activities.id, activityId))
  return { ok: true }
}
