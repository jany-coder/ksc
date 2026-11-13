import type { memberRole } from '../db/schema/enums.ts'

// What each role may do. This is the table in CLAUDE.md section 4, as code.
// No permission framework: three roles, a handful of actions, one lookup.
// `import type` keeps this file free of database code, so it is safe to use
// in the browser too (e.g. to hide a button). Hiding a button is cosmetic;
// the server function must still check (see session.server.ts).
export type Role = (typeof memberRole.enumValues)[number]

export type Action =
  | 'content.write' // activities, gallery, notices
  | 'members.read' // phone, address, blood group: admins only
  | 'members.write' // add / edit members
  | 'members.delete' // dangerous: super_admin only
  | 'members.export' // CSV export: dangerous, super_admin only
  | 'admins.manage' // create or remove admins: dangerous, super_admin only
  | 'members.changePhone' // the phone is the login name: super_admin only

const ADMINS: readonly Role[] = ['admin', 'super_admin']
const SUPER_ONLY: readonly Role[] = ['super_admin']

const allowed: Record<Action, readonly Role[]> = {
  'content.write': ADMINS,
  'members.read': ADMINS,
  'members.write': ADMINS,
  'members.delete': SUPER_ONLY,
  'members.export': SUPER_ONLY,
  'admins.manage': SUPER_ONLY,
  'members.changePhone': SUPER_ONLY,
}

export function can(role: Role, action: Action): boolean {
  return allowed[action].includes(role)
}

/**
 * May `actor` change or remove `target`? (status, delete, password reset)
 *  - never yourself: an admin must not lock themselves out or give themselves
 *    back access;
 *  - a plain admin may only touch ordinary members. Touching another admin or
 *    the super admin needs super_admin, otherwise any admin could take over an
 *    account by resetting its password.
 * This is only the "who on whom" rule; the action itself (can() above) must be
 * checked as well.
 */
export function canManageMember(
  actor: { id: string; role: Role },
  target: { id: string; role: Role },
): boolean {
  if (actor.id === target.id) return false
  if (target.role !== 'member') return actor.role === 'super_admin'
  return true
}
