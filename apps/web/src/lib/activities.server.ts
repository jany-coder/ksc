import '@tanstack/react-start/server-only'

import { and, asc, desc, eq, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities } from '../db/schema/index.ts'
import { activityFormSchema } from './activity-form.ts'
import { formatEventWhen } from './bn-datetime.ts'
import { makeSlug } from './slug.ts'

// --- Admin side: callers must have checked requirePermission('content.write') ---

export type CreateActivityResult =
  { ok: true; id: string; slug: string } | { ok: false; code: 'INVALID_INPUT' }

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
    const slug = makeSlug(v.title)
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
          createdBy: actorId,
          // Set by the database clock the moment it goes public.
          publishedAt: v.status === 'published' ? sql`now()` : null,
        })
        .returning({ id: activities.id })
      return { ok: true, id: row!.id, slug }
    } catch (error) {
      if (!isUniqueViolation(error)) throw error
    }
  }
  throw new Error('could not find a free slug')
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
  }))
}
