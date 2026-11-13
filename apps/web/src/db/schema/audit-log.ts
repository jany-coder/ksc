import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { members } from './members.ts'

// Who did what to whom, and when. CLAUDE.md section 4 requires an entry for
// every password reset and every member deletion.
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid().primaryKey().defaultRandom(),
    // SET NULL: if an admin is eventually purged, their log entries stay.
    actorId: uuid('actor_id').references(() => members.id, {
      onDelete: 'set null',
    }),
    // e.g. 'member.delete', 'member.password_reset'
    action: text().notNull(),
    // e.g. 'member'. Together with targetId it names the affected row.
    targetType: text('target_type').notNull(),
    // Deliberately NOT a foreign key: the target can be any table, and the log
    // must outlive the row it describes (a deleted member, for example).
    targetId: text('target_id').notNull(),
    // Never put phone numbers or addresses in here (CLAUDE.md section 3).
    meta: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('audit_log_actor_idx').on(t.actorId),
    index('audit_log_target_idx').on(t.targetType, t.targetId),
    index('audit_log_created_at_idx').on(t.createdAt),
  ],
)
