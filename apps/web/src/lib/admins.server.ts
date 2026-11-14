import '@tanstack/react-start/server-only'

import { and, eq, isNull } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { auditLog, members, user } from '../db/schema/index.ts'
import { auth } from './auth.ts'
import { generateTempPassword } from './temp-password.ts'

// Making and removing admins. Both are super_admin only: the caller must have
// run requirePermission('admins.manage') FIRST. Nobody changes their own role
// (a super admin is never a target: only 'member' -> 'admin' and back).

export type MakeAdminResult =
  // tempPassword is null when the person already had a login (an admin being
  // promoted keeps the password they have).
  | { ok: true; tempPassword: string | null }
  | { ok: false; code: 'NOT_FOUND' | 'NOT_ACTIVE' | 'ALREADY_ADMIN' | 'FAILED' }

/**
 * Give an active member a login and the admin role. Returns a temporary
 * password ONCE; the first sign-in forces a new one.
 */
export async function makeAdmin(
  actorId: string,
  memberId: string,
  role: 'admin' | 'super_admin' = 'admin',
): Promise<MakeAdminResult> {
  const [target] = await db
    .select({
      name: members.name,
      phone: members.phone,
      role: members.role,
      status: members.status,
      userId: members.userId,
    })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }
  // 'admin' is for plain members; 'super_admin' also accepts an admin (a step
  // up). Never yourself, and never someone who already has that role.
  const canBecome =
    role === 'admin'
      ? target.role === 'member'
      : target.role === 'member' || target.role === 'admin'
  if (!canBecome || actorId === memberId)
    return { ok: false, code: 'ALREADY_ADMIN' }
  // A pending or suspended person must not become an admin by a slip.
  if (target.status !== 'active') return { ok: false, code: 'NOT_ACTIVE' }

  const tempPassword = generateTempPassword()
  const ctx = await auth.$context
  let userId = target.userId
  // An admin who is promoted keeps their password and their login.
  let newPassword: string | null = tempPassword

  try {
    if (!userId) {
      // Same recipe as scripts/seed-super-admin.ts. The email column is
      // required by Better Auth; a reserved ".invalid" address stands in.
      const created = await ctx.internalAdapter.createUser(
        {
          email: `${target.phone}@members.invalid`,
          name: target.name,
          username: target.phone,
          emailVerified: false,
        },
        { method: 'admin' },
      )
      userId = created.id
      await ctx.internalAdapter.linkAccount({
        userId,
        providerId: 'credential',
        accountId: userId,
        password: await ctx.password.hash(tempPassword),
      })
    } else if (target.role === 'admin') {
      newPassword = null
    } else {
      await ctx.internalAdapter.updatePassword(
        userId,
        await ctx.password.hash(tempPassword),
      )
    }

    await db.batch([
      db
        .update(members)
        .set(
          newPassword === null
            ? { role }
            : { role, userId, mustChangePassword: true },
        )
        .where(eq(members.id, memberId)),
      db.insert(auditLog).values({
        actorId,
        action: role === 'super_admin' ? 'superadmin.create' : 'admin.create',
        targetType: 'member',
        targetId: memberId,
      }),
    ])
  } catch {
    // Undo a login we just created; never leave a half-made account behind.
    if (userId && !target.userId)
      await db.delete(user).where(eq(user.id, userId))
    return { ok: false, code: 'FAILED' }
  }
  return { ok: true, tempPassword: newPassword }
}

export type RemoveAdminResult =
  { ok: true } | { ok: false; code: 'NOT_FOUND' | 'NOT_ADMIN' }

/**
 * Take the admin role away: the person stays a member, but the login is deleted
 * (members have no login in v1) and every session ends at once.
 */
export async function removeAdmin(
  actorId: string,
  memberId: string,
): Promise<RemoveAdminResult> {
  const [target] = await db
    .select({ role: members.role, userId: members.userId })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  if (!target) return { ok: false, code: 'NOT_FOUND' }
  // Only plain admins: a super admin cannot be removed here, nor can you remove
  // yourself.
  if (target.role !== 'admin' || actorId === memberId)
    return { ok: false, code: 'NOT_ADMIN' }

  if (target.userId) {
    const ctx = await auth.$context
    await ctx.internalAdapter.deleteUserSessions(target.userId)
  }
  await db.batch([
    db
      .update(members)
      .set({ role: 'member', userId: null, mustChangePassword: true })
      .where(eq(members.id, memberId)),
    db.insert(auditLog).values({
      actorId,
      action: 'admin.remove',
      targetType: 'member',
      targetId: memberId,
    }),
  ])
  // After the link is cleared; the account row cascades to its password.
  if (target.userId) await db.delete(user).where(eq(user.id, target.userId))
  return { ok: true }
}
