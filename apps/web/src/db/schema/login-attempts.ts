import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Per-phone login throttle: 10 attempts, then locked for 15 minutes
// (CLAUDE.md section 5). Keyed by the normalised phone, not by IP: phone
// numbers are public knowledge locally, so the password is the only barrier.
// Rows are created for any well-formed phone, whether or not an account
// exists, so a lock cannot be used to find out which numbers are members.
// Holds no personal data beyond the number itself, and rows are deleted on a
// successful login.
export const loginAttempts = pgTable('login_attempts', {
  phone: text().primaryKey(),
  // Attempts started in the current window (a slot is claimed BEFORE the
  // password is checked, so parallel guesses cannot slip past the limit).
  attemptCount: integer('attempt_count').notNull().default(0),
  lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  // While in the future, every attempt is refused without checking anything.
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
})
