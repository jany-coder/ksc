import '@tanstack/react-start/server-only'

import { APIError } from 'better-auth/api'
import { eq, and, isNull } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { auditLog, members } from '../db/schema/index.ts'
import { auth } from './auth.ts'
import { recordSuccess } from './login-lock.ts'
import { changePasswordSchema } from './password-rules.ts'
import { canManageMember } from './permissions.ts'
import type { Role } from './permissions.ts'
import { generateTempPassword } from './temp-password.ts'
import { memberFromHeaders } from './session.server.ts'

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false
      code:
        | 'UNAUTHENTICATED'
        | 'INVALID_INPUT'
        | 'WRONG_PASSWORD'
        | 'ACCOUNT_LOCKED'
        | 'FAILED'
    }

/**
 * Let the signed-in member replace their own password, then clear the
 * "must change password" flag.
 *
 * Takes headers rather than reading the request itself, so it can be tested
 * without a live HTTP request. Deliberately NOT behind requirePermission:
 * someone on a temporary password is blocked from everything else, and this is
 * the one thing they must be able to do.
 */
export async function changeOwnPassword(
  headers: Headers,
  input: unknown,
): Promise<ChangePasswordResult> {
  const member = await memberFromHeaders(headers)
  if (!member) return { ok: false, code: 'UNAUTHENTICATED' }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }

  try {
    // Better Auth checks the current password. The login lock also counts
    // wrong guesses here (see the hooks in auth.ts). Other devices are signed
    // out: if the old password was exposed, those sessions are suspect.
    await auth.api.changePassword({
      headers,
      body: { ...parsed.data, revokeOtherSessions: true },
    })
  } catch (error) {
    if (error instanceof APIError) {
      const code = (error.body as { code?: string } | undefined)?.code
      if (code === 'ACCOUNT_LOCKED') return { ok: false, code }
      if (code === 'INVALID_PASSWORD')
        return { ok: false, code: 'WRONG_PASSWORD' }
    }
    return { ok: false, code: 'FAILED' }
  }

  // Separate statement: if this one failed the password is already changed, and
  // the person would simply be asked once more. Never the reverse.
  await db
    .update(members)
    .set({ mustChangePassword: false })
    .where(eq(members.id, member.id))

  return { ok: true }
}

export type ResetPasswordResult =
  | { ok: true; tempPassword: string }
  | { ok: false; code: 'NOT_FOUND' | 'NO_LOGIN' | 'FORBIDDEN' }

/**
 * An admin resets someone's password: generate a temporary one, force a change
 * at the next login, sign the person out everywhere, and log who did it
 * (CLAUDE.md sections 4 and 5). Call requirePermission('members.write') first.
 *
 * The temporary password is returned ONCE for the admin to pass on. It is not
 * stored in readable form and is never logged.
 */
export async function resetMemberPassword(
  actor: { id: string; role: Role },
  memberId: string,
): Promise<ResetPasswordResult> {
  const [target] = await db
    .select({
      role: members.role,
      userId: members.userId,
      phone: members.phone,
    })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }
  // Most members have no login in v1: there is no password to reset.
  if (!target.userId) return { ok: false, code: 'NO_LOGIN' }
  if (!canManageMember(actor, { id: memberId, role: target.role }))
    return { ok: false, code: 'FORBIDDEN' }

  const tempPassword = generateTempPassword()
  const ctx = await auth.$context
  await ctx.internalAdapter.updatePassword(
    target.userId,
    await ctx.password.hash(tempPassword),
  )
  // The old password may be exactly why a reset was needed: end every session.
  await ctx.internalAdapter.deleteUserSessions(target.userId)

  await db.batch([
    db
      .update(members)
      .set({ mustChangePassword: true })
      .where(eq(members.id, memberId)),
    db.insert(auditLog).values({
      actorId: actor.id,
      action: 'member.password_reset',
      targetType: 'member',
      targetId: memberId,
    }),
  ])
  // A person locked out by wrong guesses can sign in with the new password now.
  await recordSuccess(target.phone)

  return { ok: true, tempPassword }
}
