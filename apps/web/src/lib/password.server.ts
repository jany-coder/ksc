import '@tanstack/react-start/server-only'

import { APIError } from 'better-auth/api'
import { eq } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { members } from '../db/schema/index.ts'
import { auth } from './auth.ts'
import { changePasswordSchema } from './password-rules.ts'
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
