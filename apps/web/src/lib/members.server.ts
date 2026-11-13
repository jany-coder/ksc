import '@tanstack/react-start/server-only'

import { and, desc, eq, ilike, isNull, like, or, sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

import { db } from '../db/index.ts'
import { auditLog, members } from '../db/schema/index.ts'
import { memberFormSchema } from './member-form.ts'
import { MEMBER_STATUSES } from './member-options.ts'
import type { MemberStatus } from './member-options.ts'
import { PAGE_SIZE, escapeLike } from './members-query.ts'
import type { MembersSearch } from './members-query.ts'
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
