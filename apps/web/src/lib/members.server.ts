import '@tanstack/react-start/server-only'

import { and, desc, ilike, isNull, like, or, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { members } from '../db/schema/index.ts'
import { MEMBER_STATUSES } from './member-options.ts'
import type { MemberStatus } from './member-options.ts'
import { PAGE_SIZE, escapeLike } from './members-query.ts'
import type { MembersSearch } from './members-query.ts'
import { toAsciiDigits } from './phone.ts'

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
