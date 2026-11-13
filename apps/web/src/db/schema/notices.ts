import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { publishStatus } from './enums.ts'
import { members } from './members.ts'

export const notices = pgTable(
  'notices',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    body: text().notNull(),
    // Urgent notices get highlighted on the public site.
    urgent: boolean().notNull().default(false),
    status: publishStatus().notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => members.id),
  },
  (t) => [index('notices_status_published_idx').on(t.status, t.publishedAt)],
)
