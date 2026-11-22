import '@tanstack/react-start/server-only'

import { and, asc, eq, isNull, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { members } from '../db/schema/index.ts'
import { BLOOD_GROUPS } from './member-options.ts'
import type { BloodGroup } from './member-options.ts'
import { photoUrlFor } from './members.server.ts'

// The admin donor lookup: someone calls the club needing blood, an admin
// picks the group and calls a donor (CLAUDE.md section 3). Phone numbers and
// addresses, so the caller must have checked requirePermission('members.read').
// Never log what this returns.

export type DonorRow = {
  id: string
  name: string
  phone: string
  bloodGroup: BloodGroup
  gender: 'male' | 'female' | 'other' | null
  houseVillage: string | null
  upazila: string | null
  lastDonationDate: string | null
  photoUrl: string | null
}

export type DonorsData = {
  rows: DonorRow[]
  /** Donors per blood group, whatever group is picked. */
  counts: Record<BloodGroup, number>
}

// A donor: an active member, not in the bin, who said yes to giving blood.
const isDonor = () =>
  and(
    isNull(members.archivedAt),
    eq(members.status, 'active'),
    eq(members.willingToDonate, true),
  )

export async function listDonors(blood?: BloodGroup): Promise<DonorsData> {
  const [found, countRows] = await Promise.all([
    db
      .select({
        id: members.id,
        name: members.name,
        phone: members.phone,
        bloodGroup: members.bloodGroup,
        gender: members.gender,
        houseVillage: members.houseVillage,
        upazila: members.upazila,
        lastDonationDate: sql<string | null>`${members.lastDonationDate}`,
        photoR2Key: members.photoR2Key,
      })
      .from(members)
      .where(
        and(
          isDonor(),
          blood
            ? eq(members.bloodGroup, blood)
            : sql`${members.bloodGroup} is not null`,
        ),
      )
      .orderBy(asc(members.name))
      .limit(1000),
    db
      .select({ blood: members.bloodGroup, n: sql<number>`count(*)::int` })
      .from(members)
      .where(isDonor())
      .groupBy(members.bloodGroup),
  ])
  return {
    // The R2 key stays on the server; the page gets an admin-only URL.
    rows: found.map(({ photoR2Key, bloodGroup, ...row }) => ({
      ...row,
      bloodGroup: bloodGroup!,
      photoUrl: photoUrlFor(row.id, photoR2Key, 'small'),
    })),
    counts: Object.fromEntries(
      BLOOD_GROUPS.map((g) => [
        g,
        countRows.find((r) => r.blood === g)?.n ?? 0,
      ]),
    ) as Record<BloodGroup, number>,
  }
}
