import { describe, expect, it } from 'vitest'

import { can } from './permissions.ts'
import type { Action, Role } from './permissions.ts'

// Mirrors the table in CLAUDE.md section 4. If a row changes there, change it
// here on purpose: this test is what stops a permission widening by accident.
const table: Record<Action, Record<Role, boolean>> = {
  'content.write': { super_admin: true, admin: true, member: false },
  'members.read': { super_admin: true, admin: true, member: false },
  'members.write': { super_admin: true, admin: true, member: false },
  'members.delete': { super_admin: true, admin: false, member: false },
  'members.export': { super_admin: true, admin: false, member: false },
  'admins.manage': { super_admin: true, admin: false, member: false },
}

describe('can', () => {
  for (const [action, byRole] of Object.entries(table) as [
    Action,
    Record<Role, boolean>,
  ][]) {
    for (const [role, expected] of Object.entries(byRole) as [
      Role,
      boolean,
    ][]) {
      it(`${role} ${expected ? 'may' : 'may not'} ${action}`, () => {
        expect(can(role, action)).toBe(expected)
      })
    }
  }

  it('never lets a plain member see member data', () => {
    expect(can('member', 'members.read')).toBe(false)
  })

  it('keeps the three dangerous actions super_admin only', () => {
    for (const action of [
      'members.delete',
      'members.export',
      'admins.manage',
    ] as const) {
      expect(can('admin', action)).toBe(false)
    }
  })
})
