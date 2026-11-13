import '@tanstack/react-start/server-only'

import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq, isNull } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { members } from '../db/schema/index.ts'
import { auth } from './auth.ts'
import { can } from './permissions.ts'
import type { Action, Role } from './permissions.ts'

// Server-only (the import above makes the build fail if this ever reaches the
// browser). Every server function that touches member data starts with
// requirePermission(). A route guard alone is not enough: server functions are
// plain HTTP endpoints and can be called directly (CLAUDE.md section 3).

export type CurrentMember = {
  id: string
  role: Role
  mustChangePassword: boolean
}

export type AuthErrorCode =
  | 'UNAUTHENTICATED' // no valid session
  | 'PASSWORD_CHANGE_REQUIRED' // signed in, but must set a new password first
  | 'FORBIDDEN' // signed in, but this role may not do this

export class AuthError extends Error {
  readonly code: AuthErrorCode
  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}

/**
 * Session cookie -> the member behind it, or null.
 * Takes headers as a parameter so it can be tested without a live request.
 * Suspended, pending and archived members get null: they hold no powers even
 * if their login still exists.
 */
export async function memberFromHeaders(
  headers: Headers,
): Promise<CurrentMember | null> {
  const session = await auth.api.getSession({ headers })
  if (!session) return null

  const [member] = await db
    .select({
      id: members.id,
      role: members.role,
      mustChangePassword: members.mustChangePassword,
    })
    .from(members)
    .where(
      and(
        eq(members.userId, session.user.id),
        eq(members.status, 'active'),
        isNull(members.archivedAt),
      ),
    )
    .limit(1)

  return member ?? null
}

/** For the password-change page: signed in, but may still be flagged. */
export function getCurrentMember(): Promise<CurrentMember | null> {
  return memberFromHeaders(getRequestHeaders())
}

/**
 * Call first in any server function that needs a permission. Throws unless
 * the caller is signed in, has already replaced a temporary password, and
 * their role allows `action`. Returns the member so callers can log who acted.
 */
export async function requirePermission(
  action: Action,
): Promise<CurrentMember> {
  const member = await getCurrentMember()
  if (!member) throw new AuthError('UNAUTHENTICATED')
  if (member.mustChangePassword) throw new AuthError('PASSWORD_CHANGE_REQUIRED')
  if (!can(member.role, action)) throw new AuthError('FORBIDDEN')
  return member
}
