import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { members } from './members.ts'

// Small switches for the public site, one row per setting, set from the admin
// panel. A missing row means the setting's default (see lib/site-settings.ts),
// so a new setting needs no migration of its own.
export const siteSettings = pgTable('site_settings', {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedBy: uuid('updated_by').references(() => members.id, {
    onDelete: 'set null',
  }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
