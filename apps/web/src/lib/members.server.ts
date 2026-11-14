import '@tanstack/react-start/server-only'

import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  or,
  sql,
} from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

import { db } from '../db/index.ts'
import { auditLog, members, user } from '../db/schema/index.ts'
import { memberEditSchema, memberFormSchema } from './member-form.ts'
import { MEMBER_STATUSES, STATUS_LABEL_KEY } from './member-options.ts'
import { tFor } from './i18n/messages.ts'
import type { Lang } from './i18n/core.ts'
import type { MemberStatus } from './member-options.ts'
import { PAGE_SIZE, escapeLike } from './members-query.ts'
import type { MembersSearch } from './members-query.ts'
import { CsvText, toCsv } from './csv.ts'
import { canManageMember } from './permissions.ts'
import type { Role } from './permissions.ts'
import { normalizePhone, toAsciiDigits } from './phone.ts'

// Read access to member data. Every caller must have checked
// requirePermission('members.read') FIRST: this file does not check who is
// asking (CLAUDE.md section 3). See members.functions.ts.

// Only the columns the list shows. The drawer fetches the rest for one member.
export type MemberRow = {
  id: string
  name: string
  phone: string
  bloodGroup: (typeof members.$inferSelect)['bloodGroup']
  area: string | null
  occupation: string | null
  // Shown as a badge next to the name for admins and the super admin.
  role: (typeof members.$inferSelect)['role']
  status: MemberStatus
}

export type MembersPage = {
  rows: MemberRow[]
  /** Members matching the current filters, across all pages. */
  total: number
  /** Non-archived members per status, for the tab badges. */
  counts: Record<MemberStatus | 'all', number>
  page: number
  pageSize: number
}

function searchCondition(q: string) {
  const byName = ilike(members.name, `%${escapeLike(q)}%`)
  // A few digits could be part of a phone number; any fewer would match nearly
  // everyone.
  const digits = toAsciiDigits(q).replace(/\D/g, '')
  return digits.length >= 3
    ? or(byName, like(members.phone, `%${digits}%`))
    : byName
}

export async function listMembers(
  filters: MembersSearch,
): Promise<MembersPage> {
  const page = filters.page ?? 1 // absent from the URL means the first page
  const where = and(
    isNull(members.archivedAt), // archived members are in the 30-day bin
    filters.status ? sql`${members.status} = ${filters.status}` : undefined,
    filters.blood ? sql`${members.bloodGroup} = ${filters.blood}` : undefined,
    filters.q ? searchCondition(filters.q) : undefined,
  )

  // One HTTP round trip for all three queries (db.batch): over Neon's HTTP
  // driver every separate query would be its own request.
  const [rows, [total], statusCounts] = await db.batch([
    db
      .select({
        id: members.id,
        name: members.name,
        phone: members.phone,
        bloodGroup: members.bloodGroup,
        area: members.area,
        occupation: members.occupation,
        role: members.role,
        status: members.status,
      })
      .from(members)
      .where(where)
      .orderBy(desc(members.joinedAt), desc(members.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(members)
      .where(where),
    db
      .select({ status: members.status, n: sql<number>`count(*)::int` })
      .from(members)
      .where(isNull(members.archivedAt))
      .groupBy(members.status),
  ])

  const counts = { all: 0, active: 0, pending: 0, suspended: 0 }
  for (const status of MEMBER_STATUSES) {
    counts[status] = statusCounts.find((r) => r.status === status)?.n ?? 0
    counts.all += counts[status]
  }

  return {
    rows,
    total: total?.n ?? 0,
    counts,
    page,
    pageSize: PAGE_SIZE,
  }
}

export type CreateMemberResult =
  | { ok: true; id: string }
  | { ok: false; code: 'INVALID_INPUT' | 'PHONE_TAKEN' }

// Postgres reports a duplicate as error code 23505. Drizzle wraps the driver's
// error, so the code may sit on the error itself or on its `cause`.
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

const blankToNull = (text: string) => (text === '' ? null : text)

/**
 * Add a member (profile only: no login, role always 'member'). `actorId` is the
 * admin doing it; call requirePermission('members.write') first.
 *
 * The member and the audit-log entry are written in ONE batch, which Neon runs
 * as a single transaction: both are saved or neither is. So a member can never
 * exist without the record of who added them and recorded their consent.
 */
export async function createMember(
  actorId: string,
  input: unknown,
): Promise<CreateMemberResult> {
  const parsed = memberFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data
  const phone = normalizePhone(v.phone)
  if (!phone) return { ok: false, code: 'INVALID_INPUT' }

  // Chosen here, not by the database, so the audit entry can name the member.
  const id = crypto.randomUUID()

  try {
    await db.batch([
      db.insert(members).values({
        id,
        name: v.name,
        phone,
        email: blankToNull(v.email.toLowerCase()),
        bloodGroup: v.bloodGroup === '' ? null : v.bloodGroup,
        address: blankToNull(v.address),
        area: blankToNull(v.area),
        occupation: blankToNull(v.occupation),
        role: 'member', // never taken from the form
        status: v.status,
        willingToDonate: v.willingToDonate,
        // The database clock, not a time sent by the browser.
        consentGivenAt: sql`now()`,
      }),
      // No personal data in the log: who, what, and which row.
      db.insert(auditLog).values({
        actorId,
        action: 'member.create',
        targetType: 'member',
        targetId: id,
      }),
    ])
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, code: 'PHONE_TAKEN' }
    throw error
  }

  return { ok: true, id }
}

export type MemberDetail = {
  id: string
  name: string
  phone: string
  email: string | null
  bloodGroup: (typeof members.$inferSelect)['bloodGroup']
  address: string | null
  area: string | null
  occupation: string | null
  role: (typeof members.$inferSelect)['role']
  status: MemberStatus
  willingToDonate: boolean
  // "YYYY-MM-DD".
  lastDonationDate: string | null
  // Dhaka calendar days, "YYYY-MM-DD".
  consentDate: string
  joinedDate: string
  // True if this member has a login account. The account id itself never leaves
  // the server.
  hasLogin: boolean
}

const dhakaDay = (column: AnyPgColumn) =>
  sql<string>`to_char(${column} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`

/** One member with every field, for the detail drawer. Null if none (or archived). */
export async function getMember(id: string): Promise<MemberDetail | null> {
  const [row] = await db
    .select({
      id: members.id,
      name: members.name,
      phone: members.phone,
      email: members.email,
      bloodGroup: members.bloodGroup,
      address: members.address,
      area: members.area,
      occupation: members.occupation,
      role: members.role,
      status: members.status,
      willingToDonate: members.willingToDonate,
      lastDonationDate: members.lastDonationDate,
      consentDate: dhakaDay(members.consentGivenAt),
      joinedDate: dhakaDay(members.joinedAt),
      hasLogin: sql<boolean>`${members.userId} is not null`,
    })
    .from(members)
    .where(and(eq(members.id, id), isNull(members.archivedAt)))
    .limit(1)
  return row ?? null
}

export type SetStatusResult =
  | { ok: true }
  | { ok: false; code: 'INVALID_INPUT' | 'NOT_FOUND' | 'SELF' | 'FORBIDDEN' }

/**
 * Change a member's status (active / pending / suspended). Call
 * requirePermission('members.write') first.
 *
 * Who may change whom is decided by canManageMember (permissions.ts). A suspended member loses access at once: memberFromHeaders only accepts
 * 'active' members, so their next request is refused.
 */
export async function setMemberStatus(
  actor: { id: string; role: Role },
  memberId: string,
  status: unknown,
): Promise<SetStatusResult> {
  if (!MEMBER_STATUSES.some((s) => s === status))
    return { ok: false, code: 'INVALID_INPUT' }
  const next = status as MemberStatus

  if (memberId === actor.id) return { ok: false, code: 'SELF' }

  const [target] = await db
    .select({ role: members.role, status: members.status })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }
  if (!canManageMember(actor, { id: memberId, role: target.role }))
    return { ok: false, code: 'FORBIDDEN' }
  if (target.status === next) return { ok: true } // nothing to do

  // Update and log in one batch: both happen or neither.
  await db.batch([
    db.update(members).set({ status: next }).where(eq(members.id, memberId)),
    db.insert(auditLog).values({
      actorId: actor.id,
      action: 'member.status_change',
      targetType: 'member',
      targetId: memberId,
      meta: { from: target.status, to: next },
    }),
  ])
  return { ok: true }
}

export const ARCHIVE_DAYS = 30

export type ArchiveResult =
  { ok: true } | { ok: false; code: 'NOT_FOUND' | 'FORBIDDEN' }

/**
 * "Delete" a member: they vanish from every list and lose any login at once, but
 * the row stays for ARCHIVE_DAYS in case of a mistake, then
 * purgeArchivedMembers() removes it for real. Call
 * requirePermission('members.delete') first (super_admin only).
 */
export async function archiveMember(
  actor: { id: string; role: Role },
  memberId: string,
): Promise<ArchiveResult> {
  const [target] = await db
    .select({ role: members.role })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }
  if (!canManageMember(actor, { id: memberId, role: target.role }))
    return { ok: false, code: 'FORBIDDEN' }

  // Archive and log in one batch: both happen or neither. memberFromHeaders
  // ignores archived members, so any session they hold stops working at once.
  await db.batch([
    db
      .update(members)
      .set({ archivedAt: sql`now()` })
      .where(eq(members.id, memberId)),
    db.insert(auditLog).values({
      actorId: actor.id,
      action: 'member.delete',
      targetType: 'member',
      targetId: memberId,
    }),
  ])
  return { ok: true }
}

/**
 * Really delete members archived more than ARCHIVE_DAYS ago, together with their
 * login accounts. Meant to run on a schedule (not from any web request).
 * Audit-log rows stay: they hold no personal data and must outlive the member.
 * Returns how many members were removed.
 */
export async function purgeArchivedMembers(): Promise<number> {
  const cutoff = sql`now() - make_interval(days => ${ARCHIVE_DAYS})`
  const expired = await db
    .select({ id: members.id, userId: members.userId })
    .from(members)
    .where(and(isNotNull(members.archivedAt), lt(members.archivedAt, cutoff)))
  if (expired.length === 0) return 0

  const deleteMembers = db.delete(members).where(
    inArray(
      members.id,
      expired.map((m) => m.id),
    ),
  )
  const userIds = expired.flatMap((m) => (m.userId ? [m.userId] : []))
  if (userIds.length === 0) {
    await deleteMembers
  } else {
    // One batch = one transaction. Deleting the user cascades to its account
    // and sessions.
    await db.batch([
      deleteMembers,
      db.delete(user).where(inArray(user.id, userIds)),
    ])
  }
  return expired.length
}

/**
 * Every active (non-archived) member as CSV text. Call
 * requirePermission('members.export') first: this is the one place that hands
 * out ALL members' personal data at once, so it is super_admin only and every
 * export is logged.
 */
export async function exportMembersCsv(
  actorId: string,
  lang: Lang,
): Promise<{ csv: string; count: number }> {
  const t = tFor(lang)
  const rows = await db
    .select({
      name: members.name,
      phone: members.phone,
      email: members.email,
      bloodGroup: members.bloodGroup,
      address: members.address,
      area: members.area,
      occupation: members.occupation,
      status: members.status,
      willingToDonate: members.willingToDonate,
      lastDonationDate: members.lastDonationDate,
      joinedDate: sql<string>`to_char(${members.joinedAt} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`,
    })
    .from(members)
    .where(isNull(members.archivedAt))
    .orderBy(members.joinedAt, members.id)

  // Logged with a count only: no names, numbers or addresses (CLAUDE.md s.3).
  await db.insert(auditLog).values({
    actorId,
    action: 'members.export',
    targetType: 'member',
    targetId: 'all',
    meta: { count: rows.length },
  })

  const csv = toCsv(
    [
      t('csv.name'),
      t('csv.mobile'),
      t('csv.email'),
      t('csv.blood'),
      t('csv.address'),
      t('csv.area'),
      t('csv.occupation'),
      t('csv.status'),
      t('csv.willing'),
      t('csv.lastDonation'),
      t('csv.joined'),
    ],
    rows.map((r) => [
      r.name,
      new CsvText(r.phone),
      r.email,
      r.bloodGroup,
      r.address,
      r.area,
      r.occupation,
      t(STATUS_LABEL_KEY[r.status]),
      r.willingToDonate ? t('a.yes') : t('a.no'),
      r.lastDonationDate,
      r.joinedDate,
    ]),
  )
  return { csv, count: rows.length }
}

export type UpdateMemberResult =
  { ok: true } | { ok: false; code: 'INVALID_INPUT' | 'NOT_FOUND' }

/**
 * Change a member's details. Call requirePermission('members.write') first.
 *
 * Every admin and super admin may edit anyone's details, themselves and other
 * admins included: this changes information only, never access. The phone
 * number, role, consent and status are NOT editable here (the phone is the
 * member's identity and an admin's sign-in name; a super admin changes it
 * separately, see changeMemberPhone). If the member has a login, its display name follows,
 * in the SAME batch (one transaction). The audit entry records who and whom,
 * never what changed: phone numbers and addresses stay out of the log
 * (CLAUDE.md section 3).
 */
export async function updateMember(
  actor: { id: string },
  memberId: string,
  input: unknown,
): Promise<UpdateMemberResult> {
  const parsed = memberEditSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data

  const [target] = await db
    .select({ userId: members.userId })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }

  const updateProfile = db
    .update(members)
    .set({
      name: v.name,
      email: blankToNull(v.email.toLowerCase()),
      bloodGroup: v.bloodGroup === '' ? null : v.bloodGroup,
      address: blankToNull(v.address),
      area: blankToNull(v.area),
      occupation: blankToNull(v.occupation),
      willingToDonate: v.willingToDonate,
      lastDonationDate: blankToNull(v.lastDonationDate),
    })
    .where(eq(members.id, memberId))
  const log = db.insert(auditLog).values({
    actorId: actor.id,
    action: 'member.update',
    targetType: 'member',
    targetId: memberId,
  })

  if (target.userId) {
    await db.batch([
      updateProfile,
      db.update(user).set({ name: v.name }).where(eq(user.id, target.userId)),
      log,
    ])
  } else {
    await db.batch([updateProfile, log])
  }
  return { ok: true }
}

export type ChangePhoneResult =
  | { ok: true }
  | { ok: false; code: 'INVALID_INPUT' | 'NOT_FOUND' | 'PHONE_TAKEN' }

/**
 * Fix a member's phone number (typed wrong, or they got a new SIM). The phone is
 * also the login name, so both rows change in one transaction. Call
 * requirePermission('members.changePhone') first: super_admin only.
 * The audit entry records who and which member, never the numbers.
 */
export async function changeMemberPhone(
  actorId: string,
  memberId: string,
  rawPhone: string,
): Promise<ChangePhoneResult> {
  const phone = normalizePhone(rawPhone)
  if (!phone) return { ok: false, code: 'INVALID_INPUT' }

  const [target] = await db
    .select({ userId: members.userId })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }

  const log = db.insert(auditLog).values({
    actorId,
    action: 'member.phone_change',
    targetType: 'member',
    targetId: memberId,
  })
  const updateMemberPhone = db
    .update(members)
    .set({ phone })
    .where(eq(members.id, memberId))

  try {
    if (target.userId) {
      await db.batch([
        updateMemberPhone,
        db
          .update(user)
          .set({ username: phone })
          .where(eq(user.id, target.userId)),
        log,
      ])
    } else {
      await db.batch([updateMemberPhone, log])
    }
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, code: 'PHONE_TAKEN' }
    throw error
  }
  return { ok: true }
}

export type ArchivedMemberRow = {
  id: string
  name: string
  role: Role
  // Dhaka calendar day, "YYYY-MM-DD".
  archivedDate: string
  // Whole days left before the member is deleted for good.
  daysLeft: number
}

/** The 30-day bin. Call requirePermission('members.delete') first. */
export async function listArchivedMembers(): Promise<ArchivedMemberRow[]> {
  const rows = await db
    .select({
      id: members.id,
      name: members.name,
      role: members.role,
      archivedDate: sql<string>`to_char(${members.archivedAt} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`,
      daysLeft: sql<number>`greatest(0, ${ARCHIVE_DAYS} - floor(extract(epoch from (now() - ${members.archivedAt})) / 86400))::int`,
    })
    .from(members)
    .where(isNotNull(members.archivedAt))
    .orderBy(desc(members.archivedAt))
  return rows
}

export type RestoreResult = { ok: true } | { ok: false; code: 'NOT_FOUND' }

/** Take a member out of the bin. Call requirePermission('members.delete') first. */
export async function restoreMember(
  actorId: string,
  memberId: string,
): Promise<RestoreResult> {
  const [target] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.id, memberId), isNotNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }
  await db.batch([
    db
      .update(members)
      .set({ archivedAt: null })
      .where(eq(members.id, memberId)),
    db.insert(auditLog).values({
      actorId,
      action: 'member.restore',
      targetType: 'member',
      targetId: memberId,
    }),
  ])
  return { ok: true }
}
