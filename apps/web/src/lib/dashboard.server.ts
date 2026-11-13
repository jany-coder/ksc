import '@tanstack/react-start/server-only'

import { and, eq, isNull, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities, members, notices } from '../db/schema/index.ts'
import { BLOOD_GROUPS, MEMBER_STATUSES } from './member-options.ts'
import type { BloodGroup, MemberStatus } from './member-options.ts'

// Counts only, never a person's details. Call requirePermission('members.read')
// first: the blood-group numbers come from member data.
export type DashboardData = {
  members: Record<MemberStatus | 'all', number>
  /** Active members willing to donate, per blood group. */
  donors: Record<BloodGroup, number>
  activities: { published: number; draft: number }
  notices: { published: number; draft: number }
}

export async function getDashboard(): Promise<DashboardData> {
  const live = isNull(members.archivedAt)
  const [statusRows, donorRows, activityRows, noticeRows] = await Promise.all([
    db
      .select({ status: members.status, n: sql<number>`count(*)::int` })
      .from(members)
      .where(live)
      .groupBy(members.status),
    db
      .select({ blood: members.bloodGroup, n: sql<number>`count(*)::int` })
      .from(members)
      .where(
        and(
          live,
          eq(members.status, 'active'),
          eq(members.willingToDonate, true),
        ),
      )
      .groupBy(members.bloodGroup),
    db
      .select({ status: activities.status, n: sql<number>`count(*)::int` })
      .from(activities)
      .groupBy(activities.status),
    db
      .select({ status: notices.status, n: sql<number>`count(*)::int` })
      .from(notices)
      .groupBy(notices.status),
  ])

  const memberCounts = { all: 0, active: 0, pending: 0, suspended: 0 }
  for (const status of MEMBER_STATUSES) {
    memberCounts[status] = statusRows.find((r) => r.status === status)?.n ?? 0
    memberCounts.all += memberCounts[status]
  }
  const donors = Object.fromEntries(
    BLOOD_GROUPS.map((g) => [g, donorRows.find((r) => r.blood === g)?.n ?? 0]),
  ) as Record<BloodGroup, number>
  const split = (rows: { status: string; n: number }[]) => ({
    published: rows.find((r) => r.status === 'published')?.n ?? 0,
    draft: rows.find((r) => r.status === 'draft')?.n ?? 0,
  })
  return {
    members: memberCounts,
    donors,
    activities: split(activityRows),
    notices: split(noticeRows),
  }
}
