import '@tanstack/react-start/server-only'

import { and, asc, eq, isNull, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities, images, members, notices } from '../db/schema/index.ts'
import { storageState } from './image-limits.ts'
import type { StorageState } from './image-limits.ts'
import { usedBytes } from './images.server.ts'
import { BLOOD_GROUPS, MEMBER_STATUSES } from './member-options.ts'
import type { BloodGroup, MemberStatus } from './member-options.ts'

// Counts only, never a person's details. Call requirePermission('members.read')
// first: the blood-group numbers come from member data.
export type DashboardData = {
  members: Record<MemberStatus | 'all', number>
  /** Joined in the current month (Dhaka calendar). */
  newThisMonth: number
  /** Active members willing to donate, per blood group. */
  donors: Record<BloodGroup, number>
  activities: {
    published: number
    draft: number
    /** Published and dated today or later. */
    upcoming: number
    /** Published but no photo filed under them yet. */
    withoutPhotos: number
  }
  /** The next few published activities, soonest first. */
  nextActivities: {
    id: string
    title: string
    eventDate: string
    location: string | null
  }[]
  notices: { published: number; draft: number; urgent: number }
  photos: {
    total: number
    /** Not yet filed under any activity. */
    unfiled: number
    usedBytes: number
    state: StorageState
  }
}

const count = sql<number>`count(*)::int`
// Today, as the club's calendar sees it.
const today = sql`(now() at time zone 'Asia/Dhaka')::date`

export async function getDashboard(): Promise<DashboardData> {
  const live = isNull(members.archivedAt)
  const upcoming = and(
    eq(activities.status, 'published'),
    sql`${activities.eventDate} >= ${today}`,
  )

  const [
    statusRows,
    [newRow],
    donorRows,
    activityRows,
    [upcomingRow],
    [noPhotosRow],
    nextActivities,
    noticeRows,
    [urgentRow],
    [photoRow],
    used,
  ] = await Promise.all([
    db
      .select({ status: members.status, n: count })
      .from(members)
      .where(live)
      .groupBy(members.status),
    // Joined this month, by the Dhaka calendar.
    db
      .select({ n: count })
      .from(members)
      .where(
        and(
          live,
          sql`${members.joinedAt} >= date_trunc('month', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka'`,
        ),
      ),
    db
      .select({ blood: members.bloodGroup, n: count })
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
      .select({ status: activities.status, n: count })
      .from(activities)
      .groupBy(activities.status),
    db.select({ n: count }).from(activities).where(upcoming),
    db
      .select({ n: count })
      .from(activities)
      .where(
        and(
          eq(activities.status, 'published'),
          sql`not exists (select 1 from ${images} where ${images.activityId} = ${activities.id})`,
        ),
      ),
    db
      .select({
        id: activities.id,
        title: activities.title,
        eventDate: sql<string>`${activities.eventDate}`,
        location: activities.location,
      })
      .from(activities)
      .where(upcoming)
      .orderBy(asc(activities.eventDate), asc(activities.eventTime))
      .limit(3),
    db
      .select({ status: notices.status, n: count })
      .from(notices)
      .groupBy(notices.status),
    db
      .select({ n: count })
      .from(notices)
      .where(and(eq(notices.status, 'published'), eq(notices.urgent, true))),
    db
      .select({
        total: count,
        unfiled: sql<number>`count(*) filter (where ${images.activityId} is null)::int`,
      })
      .from(images),
    usedBytes(),
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
    newThisMonth: newRow?.n ?? 0,
    donors,
    activities: {
      ...split(activityRows),
      upcoming: upcomingRow?.n ?? 0,
      withoutPhotos: noPhotosRow?.n ?? 0,
    },
    nextActivities,
    notices: { ...split(noticeRows), urgent: urgentRow?.n ?? 0 },
    photos: {
      total: photoRow?.total ?? 0,
      unfiled: photoRow?.unfiled ?? 0,
      usedBytes: used,
      state: storageState(used),
    },
  }
}
