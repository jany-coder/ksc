import { sql } from 'drizzle-orm'
import {
  boolean,
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
    // Picked by an admin to show on the homepage (at most 6; see
    // HOME_PHOTO_COUNT). Empty homepage slots fall back to the newest photos.
    onHome: boolean('on_home').notNull().default(false),
    // The hero at the top of the homepage, picked apart from the gallery
    // picks above. heroOrder: the photo's place in the hero's photo frame
    // (1 first; empty when it is not there, at most HERO_SLIDE_COUNT).
    // heroBackground: the one photo behind the hero.
    heroOrder: integer('hero_order'),
    heroBackground: boolean('hero_background').notNull().default(false),
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
    // The database itself keeps it to one background and one photo per place.
    uniqueIndex('images_hero_background_unique')
      .on(t.heroBackground)
      .where(sql`${t.heroBackground}`),
    uniqueIndex('images_hero_order_unique')
      .on(t.heroOrder)
      .where(sql`${t.heroOrder} is not null`),
  ],
)
