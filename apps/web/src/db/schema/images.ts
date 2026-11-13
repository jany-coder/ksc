import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { activities } from './activities.ts'
import { members } from './members.ts'

// The database stores R2 object keys only, never the files themselves.
// Each image has two sizes: a 400px thumbnail for grids and a 1600px version
// for the lightbox (CLAUDE.md section 7).
export const images = pgTable(
  'images',
  {
    id: uuid().primaryKey().defaultRandom(),
    r2Key: text('r2_key').notNull(),
    thumbR2Key: text('thumb_r2_key').notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    bytes: integer().notNull(),
    caption: text(),
    // Nullable: gallery photos need not belong to an activity. Deleting the
    // activity keeps the photo and just clears this link.
    activityId: uuid('activity_id').references(() => activities.id, {
      onDelete: 'set null',
    }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => members.id),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('images_r2_key_unique').on(t.r2Key),
    index('images_activity_id_idx').on(t.activityId),
  ],
)
