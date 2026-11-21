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
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

import { activityCategories } from './activity-categories.ts'
import { publishStatus } from './enums.ts'
import { images } from './images.ts'
import { members } from './members.ts'

export const activities = pgTable(
  'activities',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    // Used in the public URL, so it must be unique.
    slug: text().notNull(),
    description: text(),
    // The activity's kind. Restrict: a kind in use cannot be deleted (the
    // admin panel offers "hide" instead).
    categoryId: uuid('category_id').references(() => activityCategories.id, {
      onDelete: 'restrict',
    }),
    // DEPRECATED: the kind's Bengali name, from before kinds had their own
    // table. Still written (the version of the site that is live now reads
    // it); dropped once this code is deployed.
    category: text(),
    // `date` and `time` are separate columns: an event can have a day but no
    // fixed hour yet.
    eventDate: date('event_date'),
    eventTime: time('event_time'),
    location: text(),
    // The two tables reference each other (images.activity_id too), so the
    // reference is a function: it is only read once both files have loaded.
    // AnyPgColumn tells TypeScript the type, which it cannot infer in a cycle.
    // Deleting the cover image keeps the activity and just clears the cover.
    coverImageId: uuid('cover_image_id').references(
      (): AnyPgColumn => images.id,
      { onDelete: 'set null' },
    ),
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
    index('activities_category_id_idx').on(t.categoryId),
  ],
)
