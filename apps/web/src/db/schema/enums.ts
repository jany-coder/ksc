import { pgEnum } from 'drizzle-orm/pg-core'

// A pgEnum becomes a real Postgres ENUM type: the database itself rejects any
// value outside the list. Declared once here and reused by several tables.
// To add a value later, write a migration (ALTER TYPE ... ADD VALUE).

// Three roles, one column, no permission framework (CLAUDE.md section 4).
export const memberRole = pgEnum('member_role', [
  'super_admin',
  'admin',
  'member',
])

export const memberStatus = pgEnum('member_status', [
  'active',
  'pending',
  'suspended',
])

export const bloodGroup = pgEnum('blood_group', [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
])

// Shared by activities and notices.
export const publishStatus = pgEnum('publish_status', ['draft', 'published'])
