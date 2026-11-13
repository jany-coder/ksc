import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins/username'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '../db/index.ts'
import * as schema from '../db/schema/index.ts'
import { claimAttempt, recordFailure, recordSuccess } from './login-lock.ts'
import { normalizePhone } from './phone.ts'

const DAY = 60 * 60 * 24

const SIGN_IN = '/sign-in/username'

// The phone being signed in, normalised, or null if the body has none or it is
// not a valid number (the username validator rejects those; nothing to count).
function phoneFromBody(body: unknown): string | null {
  const raw = (body as { username?: unknown } | null | undefined)?.username
  return typeof raw === 'string' ? normalizePhone(raw) : null
}

export const auth = betterAuth({
  // Better Auth reads and writes its own tables (user, session, account,
  // verification) through our Drizzle instance.
  database: drizzleAdapter(db, { provider: 'pg', schema }),

  // Our tables use uuid ids; without this Better Auth would generate text ids.
  advanced: { database: { generateId: 'uuid' } },

  emailAndPassword: {
    enabled: true,
    // Accounts are created by admins only, never by visitors. With the auth
    // route public, an open sign-up endpoint would let anyone make an account.
    disableSignUp: true,
  },

  // Members visit rarely, so sessions are long: 60 days, extended by one day
  // of activity at a time (CLAUDE.md section 5).
  session: { expiresIn: 60 * DAY, updateAge: DAY },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Email sign-in is off. Our placeholder emails (<phone>@members.invalid)
      // are guessable, so this endpoint would be a way around the phone lock.
      if (ctx.path === '/sign-in/email') {
        throw new APIError('NOT_FOUND', { message: 'Not found' })
      }
      if (ctx.path !== SIGN_IN) return

      const phone = phoneFromBody(ctx.body)
      if (!phone) return
      // Claim an attempt first; if the phone is locked, refuse without even
      // looking at the password. The UI shows its own Bengali text for the code.
      if (await claimAttempt(phone)) {
        throw new APIError('TOO_MANY_REQUESTS', {
          message: 'Too many failed attempts. Try again in 15 minutes.',
          code: 'ACCOUNT_LOCKED',
        })
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== SIGN_IN) return
      const phone = phoneFromBody(ctx.body)
      if (!phone) return
      if (ctx.context.returned instanceof APIError) await recordFailure(phone)
      else await recordSuccess(phone)
    }),
  },

  plugins: [
    // The phone number is the username. It is normalised first, so
    // "017-1234-5678" and "+8801712345678" sign in to the same account.
    username({
      usernameNormalization: (value) => normalizePhone(value) ?? value,
      // Validate AFTER normalising: the raw input has dashes and a '+'.
      validationOrder: { username: 'post-normalization' },
      usernameValidator: (value) => normalizePhone(value) === value,
      // We do not use a separate display name; the member's name is in `members`.
      displayUsername: false,
    }),
    // Must be the last plugin: lets Better Auth set cookies inside TanStack
    // Start server functions.
    tanstackStartCookies(),
  ],
})
