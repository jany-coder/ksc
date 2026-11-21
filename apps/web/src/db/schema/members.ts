import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth.ts'
import {
  bloodGroup,
  gender,
  maritalStatus,
  memberRole,
  memberStatus,
} from './enums.ts'

// Personal data lives here, so every query on this table must sit behind an
// admin check on the server function (CLAUDE.md section 3).
export const members = pgTable(
  'members',
  {
    // Random UUID rather than 1, 2, 3...: ids never leak how many members exist.
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    // Stored normalised as 01XXXXXXXXX; see the CHECK below.
    phone: text().notNull(),
    // Optional for now; later enables self-service password reset.
    email: text(),
    // Nullable: someone may not know their group when they join.
    bloodGroup: bloodGroup('blood_group'),
    // Personal details (all optional; see lib/member-profile.ts). No National
    // ID number, on purpose.
    fatherName: text('father_name'),
    motherName: text('mother_name'),
    dateOfBirth: date('date_of_birth'),
    gender: gender(),
    maritalStatus: maritalStatus('marital_status'),
    occupation: text(),
    organization: text(),
    // The address in Bangladeshi form. Replaces the old free-text address and
    // area columns: migration 0006 copied their text into house_village. The
    // old columns are still in the database until the new code is deployed
    // (the live site still writes them); a later migration copies once more
    // and drops them. Nothing here reads them any more.
    houseVillage: text('house_village'),
    roadWard: text('road_ward'),
    postOffice: text('post_office'),
    postCode: text('post_code'),
    upazila: text(),
    district: text(),

    // The login account for this member, if they have one. Most members will
    // not in v1, so this is nullable. Unique: one login, one member profile.
    // If the login is deleted the member record stays, only the link clears.
    // Role and must_change_password below stay HERE, not on `user`, so "who is
    // an admin" lives in one place: look the member up by session.userId.
    userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),

    role: memberRole().notNull().default('member'),
    // Set on account creation and after an admin resets a password. The password
    // itself is stored by Better Auth in account.password, never here.
    mustChangePassword: boolean('must_change_password').notNull().default(true),

    status: memberStatus().notNull().default('pending'),
    willingToDonate: boolean('willing_to_donate').notNull().default(false),
    lastDonationDate: date('last_donation_date'),

    // Required: a member cannot exist without recorded consent
    // (Personal Data Protection Act, 2026).
    consentGivenAt: timestamp('consent_given_at', {
      withTimezone: true,
    }).notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Soft delete: archived rows are purged for real after 30 days.
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('members_phone_unique').on(t.phone),
    uniqueIndex('members_user_id_unique').on(t.userId),
    index('members_blood_group_idx').on(t.bloodGroup),
    index('members_status_idx').on(t.status),
    // Bangladeshi mobile: 01, then 3-9, then 8 more digits.
    check('members_phone_format', sql`${t.phone} ~ '^01[3-9][0-9]{8}$'`),
    check('members_post_code_format', sql`${t.postCode} ~ '^[0-9]{4}$'`),
  ],
)
