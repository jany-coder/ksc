import {
  boolean,
  date,
  index,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { publishStatus } from './enums.ts'
import { members } from './members.ts'

export const activities = pgTable(
  'activities',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    // Used in the public URL, so it must be unique.
    slug: text().notNull(),
    description: text(),
    category: text(),
    // `date` and `time` are separate columns: an event can have a day but no
    // fixed hour yet.
    eventDate: date('event_date'),
    eventTime: time('event_time'),
    location: text(),
    // Points at images.id. The foreign key is added together with the images
    // table, because the two tables reference each other.
    coverImageId: uuid('cover_image_id'),
    status: publishStatus().notNull().default('draft'),
    featured: boolean().notNull().default(false),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => members.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Null while a draft; set when the activity is published.
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('activities_slug_unique').on(t.slug),
    index('activities_event_date_idx').on(t.eventDate),
  ],
)
