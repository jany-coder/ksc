import '@tanstack/react-start/server-only'

import { and, asc, desc, eq, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities } from '../db/schema/index.ts'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_CATEGORY_SLUG,
  activityFormSchema,
} from './activity-form.ts'
import type { ActivityFormInput } from './activity-form.ts'
import { formatEventWhen } from './bn-datetime.ts'
import { imageUrl } from './image-limits.ts'
import { makeSlug } from './slug.ts'

// --- Admin side: callers must have checked requirePermission('content.write') ---

export type CreateActivityResult =
  { ok: true; id: string; slug: string } | { ok: false; code: 'INVALID_INPUT' }

// 23503 = a foreign key points at a row that does not exist (e.g. a cover photo
// that was deleted a moment ago).
function isForeignKeyViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23503' || e?.cause?.code === '23503'
}

const blankToNull = (text: string) => (text === '' ? null : text)

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

/** Add an activity. `actorId` is the admin creating it. */
export async function createActivity(
  actorId: string,
  input: unknown,
): Promise<CreateActivityResult> {
  const parsed = activityFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data

  // The random suffix makes a collision very unlikely; if one happens anyway the
  // unique index rejects it and we simply draw another suffix.
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = makeSlug({
      title: v.title,
      categorySlug: v.category ? ACTIVITY_CATEGORY_SLUG[v.category] : undefined,
      date: v.eventDate || undefined,
    })
    try {
      const [row] = await db
        .insert(activities)
        .values({
          title: v.title,
          slug,
          description: blankToNull(v.description),
          category: blankToNull(v.category),
          eventDate: blankToNull(v.eventDate),
          eventTime: blankToNull(v.eventTime),
          location: blankToNull(v.location),
          status: v.status,
          featured: v.featured,
          coverImageId: blankToNull(v.coverImageId),
          createdBy: actorId,
          // Set by the database clock the moment it goes public.
          publishedAt: v.status === 'published' ? sql`now()` : null,
        })
        .returning({ id: activities.id })
      return { ok: true, id: row!.id, slug }
    } catch (error) {
      if (isForeignKeyViolation(error))
        return { ok: false, code: 'INVALID_INPUT' }
      if (!isUniqueViolation(error)) throw error
    }
  }
  throw new Error('could not find a free slug')
}

/** One activity's values, shaped for the edit form. Null if it does not exist. */
export async function getActivity(
  id: string,
): Promise<ActivityFormInput | null> {
  const [row] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1)
  if (!row) return null
  return {
    title: row.title,
    description: row.description ?? '',
    category: ACTIVITY_CATEGORIES.find((c) => c === row.category) ?? '',
    eventDate: row.eventDate ?? '',
    // The database gives "15:30:00"; the form's time field wants "15:30".
    eventTime: row.eventTime?.slice(0, 5) ?? '',
    location: row.location ?? '',
    status: row.status,
    featured: row.featured,
    coverImageId: row.coverImageId ?? '',
  }
}

export type UpdateActivityResult =
  { ok: true } | { ok: false; code: 'INVALID_INPUT' | 'NOT_FOUND' }

/**
 * Save changes to an activity. The slug (the public URL part) is left alone, so
 * links to the activity keep working after an edit.
 */
export async function updateActivity(
  id: string,
  input: unknown,
): Promise<UpdateActivityResult> {
  const parsed = activityFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data
  try {
    const rows = await db
      .update(activities)
      .set({
        title: v.title,
        description: blankToNull(v.description),
        category: blankToNull(v.category),
        eventDate: blankToNull(v.eventDate),
        eventTime: blankToNull(v.eventTime),
        location: blankToNull(v.location),
        status: v.status,
        featured: v.featured,
        coverImageId: blankToNull(v.coverImageId),
        // First publication stamps the time; later edits and a switch back to
        // draft keep it as it was.
        ...(v.status === 'published'
          ? { publishedAt: sql`coalesce(${activities.publishedAt}, now())` }
          : {}),
      })
      .where(eq(activities.id, id))
      .returning({ id: activities.id })
    return rows.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
  } catch (error) {
    if (isForeignKeyViolation(error))
      return { ok: false, code: 'INVALID_INPUT' }
    throw error
  }
}

export type DeleteActivityResult =
  { ok: true } | { ok: false; code: 'NOT_FOUND' }

/** Delete an activity. Its photos stay in the gallery (their link is cleared). */
export async function deleteActivity(
  id: string,
): Promise<DeleteActivityResult> {
  const rows = await db
    .delete(activities)
    .where(eq(activities.id, id))
    .returning({ id: activities.id })
  return rows.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
}

export type ActivityRow = {
  id: string
  title: string
  status: 'draft' | 'published'
  category: string | null
  eventDate: string | null
  featured: boolean
}

/** Every activity, drafts included, newest first. For the admin list. */
export async function listActivities(): Promise<ActivityRow[]> {
  return db
    .select({
      id: activities.id,
      title: activities.title,
      status: activities.status,
      category: activities.category,
      eventDate: activities.eventDate,
      featured: activities.featured,
    })
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(100)
}

// --- Public side: anyone can call this, so it returns the bare minimum ---

export type PublicActivity = {
  id: string
  title: string
  description: string
  dateLabel: string
  location: string
  // The cover photo's thumbnail, only when the activity has one.
  imageUrl?: string
}

function shorten(text: string, max: number): string {
  const chars = Array.from(text) // by code point, so a Bengali letter is not cut in half
  return chars.length <= max
    ? text
    : `${chars.slice(0, max).join('').trimEnd()}…`
}

/**
 * Published activities happening today or later (Dhaka time), featured first,
 * then soonest. Public: no login. Never returns drafts, and never returns who
 * created an activity.
 */
export async function listUpcomingPublic(limit = 3): Promise<PublicActivity[]> {
  const rows = await db
    .select({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      eventDate: activities.eventDate,
      eventTime: activities.eventTime,
      location: activities.location,
      coverImageId: activities.coverImageId,
    })
    .from(activities)
    .where(
      and(
        eq(activities.status, 'published'),
        sql`${activities.eventDate} >= (now() at time zone 'Asia/Dhaka')::date`,
      ),
    )
    .orderBy(
      desc(activities.featured),
      asc(activities.eventDate),
      asc(activities.eventTime),
    )
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: shorten(r.description ?? '', 220),
    dateLabel: formatEventWhen(r.eventDate, r.eventTime),
    location: r.location ?? '',
    ...(r.coverImageId ? { imageUrl: imageUrl(r.coverImageId, 'thumb') } : {}),
  }))
}
