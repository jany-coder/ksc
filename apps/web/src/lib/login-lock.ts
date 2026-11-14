import '@tanstack/react-start/server-only'

import { eq, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { loginAttempts as t } from '../db/schema/index.ts'

// 10 attempts on a phone number, then locked for 15 minutes (CLAUDE.md
// section 5). Better Auth's own rate limit works per IP and cannot do this.
//
// Why a slot is claimed BEFORE the password is checked: if we counted only
// after a failure, an attacker could fire 100 guesses at once, all would read
// "0 failures so far" and all would be checked. Claiming is one atomic SQL
// statement, so at most MAX guesses ever reach the password check per window.
//
// Neon over HTTP has no multi-statement transactions, so every function here
// is a single statement on purpose.
export const MAX_ATTEMPTS = 10
export const LOCK_MINUTES = 15

const locked = sql`${t.lockedUntil} > now()`
// The window is over (and any lock has expired with it): start counting again.
const windowOver = sql`${t.lastAttemptAt} < now() - make_interval(mins => ${LOCK_MINUTES})`

/**
 * Claim one attempt for this phone. Returns true if the phone is locked and
 * the attempt must be refused WITHOUT checking the password.
 */
export async function claimAttempt(phone: string): Promise<boolean> {
  const [row] = await db
    .insert(t)
    .values({ phone, attemptCount: 1 })
    .onConflictDoUpdate({
      target: t.phone,
      // In SET, column references mean the row's values BEFORE this update.
      set: {
        // Locked: do not count (nothing is checked while locked).
        attemptCount: sql`case
          when ${locked} then ${t.attemptCount}
          when ${windowOver} then 1
          else ${t.attemptCount} + 1 end`,
        lastAttemptAt: sql`case when ${locked} then ${t.lastAttemptAt} else now() end`,
        // The (MAX+1)th attempt in a window finds the phone locked.
        lockedUntil: sql`case
          when ${locked} then ${t.lockedUntil}
          when ${windowOver} then null
          when ${t.attemptCount} + 1 > ${MAX_ATTEMPTS}
            then now() + make_interval(mins => ${LOCK_MINUTES})
          else null end`,
      },
    })
    .returning({
      locked: sql<boolean>`coalesce(${t.lockedUntil} > now(), false)`,
    })

  return row?.locked ?? false
}

/**
 * Call after a failed password check. Locks right away on the last allowed
 * attempt, so the person is told immediately rather than on the next try.
 */
export async function recordFailure(phone: string): Promise<void> {
  await db
    .update(t)
    .set({ lockedUntil: sql`now() + make_interval(mins => ${LOCK_MINUTES})` })
    .where(
      sql`${t.phone} = ${phone}
        and ${t.attemptCount} >= ${MAX_ATTEMPTS}
        and (${t.lockedUntil} is null or ${t.lockedUntil} <= now())`,
    )
}

/** A correct password clears the slate. */
export async function recordSuccess(phone: string): Promise<void> {
  await db.delete(t).where(eq(t.phone, phone))
}
