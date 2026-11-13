import '@tanstack/react-start/server-only'

import { desc, eq, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { notices } from '../db/schema/index.ts'
import { formatBnDate } from './bn-datetime.ts'
import { noticeFormSchema } from './notice-form.ts'
import type { NoticeFormInput } from './notice-form.ts'

// --- Admin side: callers must have checked requirePermission('content.write') ---

export type CreateNoticeResult =
  { ok: true; id: string } | { ok: false; code: 'INVALID_INPUT' }

/** Add a notice. `actorId` is the admin creating it. */
export async function createNotice(
  actorId: string,
  input: unknown,
): Promise<CreateNoticeResult> {
  const parsed = noticeFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data

  const [row] = await db
    .insert(notices)
    .values({
      title: v.title,
      body: v.body,
      urgent: v.urgent,
      status: v.status,
      createdBy: actorId,
      // Set by the database clock the moment it goes public.
      publishedAt: v.status === 'published' ? sql`now()` : null,
    })
    .returning({ id: notices.id })
  return { ok: true, id: row!.id }
}

/** One notice's values, shaped for the edit form. Null if it does not exist. */
export async function getNotice(id: string): Promise<NoticeFormInput | null> {
  const [row] = await db
    .select({
      title: notices.title,
      body: notices.body,
      urgent: notices.urgent,
      status: notices.status,
    })
    .from(notices)
    .where(eq(notices.id, id))
    .limit(1)
  return row ?? null
}

export type UpdateNoticeResult =
  { ok: true } | { ok: false; code: 'INVALID_INPUT' | 'NOT_FOUND' }

export async function updateNotice(
  id: string,
  input: unknown,
): Promise<UpdateNoticeResult> {
  const parsed = noticeFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data
  const rows = await db
    .update(notices)
    .set({
      title: v.title,
      body: v.body,
      urgent: v.urgent,
      status: v.status,
      // First publication stamps the time; later edits and a switch back to
      // draft keep it as it was.
      ...(v.status === 'published'
        ? { publishedAt: sql`coalesce(${notices.publishedAt}, now())` }
        : {}),
    })
    .where(eq(notices.id, id))
    .returning({ id: notices.id })
  return rows.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
}

export type DeleteNoticeResult = { ok: true } | { ok: false; code: 'NOT_FOUND' }

export async function deleteNotice(id: string): Promise<DeleteNoticeResult> {
  const rows = await db
    .delete(notices)
    .where(eq(notices.id, id))
    .returning({ id: notices.id })
  return rows.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
}

export type NoticeRow = {
  id: string
  title: string
  status: 'draft' | 'published'
  urgent: boolean
  // "YYYY-MM-DD" in Dhaka time, or null for a draft.
  publishedDate: string | null
}

// The date a notice went public, as Dhaka's calendar day (a notice posted at
// 11pm in Dhaka is still "today" there, though it is already tomorrow in UTC).
const dhakaDate = sql<
  string | null
>`to_char(${notices.publishedAt} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`

/** Every notice, drafts first (they have no date yet), then newest. For the admin list. */
export async function listNotices(): Promise<NoticeRow[]> {
  return db
    .select({
      id: notices.id,
      title: notices.title,
      status: notices.status,
      urgent: notices.urgent,
      publishedDate: dhakaDate,
    })
    .from(notices)
    .orderBy(sql`${notices.publishedAt} desc nulls first`)
    .limit(100)
}

// --- Public side: anyone can call this, so it returns the bare minimum ---

export type PublicNotice = {
  id: string
  title: string
  body: string
  dateLabel: string
  urgent: boolean
}

/**
 * Published notices, urgent ones first, then newest. Public: no login. Never
 * returns drafts, and never returns who wrote a notice.
 */
export async function listPublicNotices(limit = 5): Promise<PublicNotice[]> {
  const rows = await db
    .select({
      id: notices.id,
      title: notices.title,
      body: notices.body,
      urgent: notices.urgent,
      publishedDate: dhakaDate,
    })
    .from(notices)
    .where(eq(notices.status, 'published'))
    .orderBy(desc(notices.urgent), desc(notices.publishedAt))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    urgent: r.urgent,
    dateLabel: r.publishedDate ? formatBnDate(r.publishedDate) : '[তারিখ]',
  }))
}
