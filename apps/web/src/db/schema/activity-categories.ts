import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// The kinds of activity (blood donation, relief, ...). A table rather than a
// list in the code, so the super admin can add new kinds without a code change.
// Each has a Bengali and an English name: the site shows the reader's
// language, and the English name gives new activities a readable English URL.
export const activityCategories = pgTable(
  'activity_categories',
  {
    id: uuid().primaryKey().defaultRandom(),
    nameBn: text('name_bn').notNull(),
    nameEn: text('name_en').notNull(),
    // Hidden: no longer offered for new activities, but the ones that already
    // use it keep it. A kind in use is hidden, never deleted.
    hidden: boolean().notNull().default(false),
    // Kinds are listed in the order they were added.
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // No two kinds with the same name, whatever the letter case.
    uniqueIndex('activity_categories_name_bn_unique').on(
      sql`lower(${t.nameBn})`,
    ),
    uniqueIndex('activity_categories_name_en_unique').on(
      sql`lower(${t.nameEn})`,
    ),
  ],
)
