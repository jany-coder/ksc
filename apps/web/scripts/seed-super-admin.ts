// One-time bootstrap: creates the FIRST super_admin. Public sign-up is off, so
// without this there is no way to log in at all.
//
//   node --env-file=.env scripts/seed-super-admin.ts --name "<full name>" --phone "<phone>"
//
// - Generates a random temporary password and prints it once. It is not stored
//   anywhere else; must_change_password is set, so the first login forces a
//   new one (CLAUDE.md section 5).
// - Refuses to run if a super_admin already exists, so it cannot be used as a
//   back door. Later admins are created from the admin panel.
// - Records consent_given_at = now: only run this for the person who has
//   agreed to hold the account (consent is required by the PDPA, 2026).
// - Never prints the phone number (CLAUDE.md section 3).
import { randomBytes } from 'node:crypto'
import { parseArgs } from 'node:util'

import { eq } from 'drizzle-orm'

import { db } from '../src/db/index.ts'
import { members, user } from '../src/db/schema/index.ts'
import { auth } from '../src/lib/auth.ts'
import { normalizePhone } from '../src/lib/phone.ts'

const { values } = parseArgs({
  options: { name: { type: 'string' }, phone: { type: 'string' } },
})

function fail(message: string): never {
  console.error(`Error: ${message}`)
  process.exit(1)
}

const name = values.name?.trim()
if (!name) fail('--name is required')
if (!values.phone) fail('--phone is required')
const phone = normalizePhone(values.phone)
if (!phone) fail('--phone is not a valid Bangladeshi mobile number')

const existingSuper = await db
  .select({ id: members.id })
  .from(members)
  .where(eq(members.role, 'super_admin'))
  .limit(1)
if (existingSuper.length > 0) {
  fail(
    'a super_admin already exists; create further admins from the admin panel',
  )
}

const existingPhone = await db
  .select({ id: members.id })
  .from(members)
  .where(eq(members.phone, phone))
  .limit(1)
if (existingPhone.length > 0) fail('a member with this phone already exists')

const tempPassword = randomBytes(12).toString('base64url') // 16 characters
const ctx = await auth.$context

// Neon over HTTP has no multi-statement transactions, so these are three
// separate writes. If one fails, undo what was created.
let userId: string | undefined
try {
  // The email column is required by Better Auth; members without a real email
  // get a placeholder on a reserved ".invalid" domain.
  // The second argument tells Better Auth how this user came to exist.
  // "admin" = provisioned by an operator, not self sign-up.
  const created = await ctx.internalAdapter.createUser(
    {
      email: `${phone}@members.invalid`,
      name,
      username: phone,
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

  const [member] = await db
    .insert(members)
    .values({
      name,
      phone,
      role: 'super_admin',
      status: 'active',
      mustChangePassword: true,
      consentGivenAt: new Date(),
      userId,
    })
    .returning({ id: members.id })

  console.log(`Created super_admin "${name}" (member id ${member?.id}).`)
  console.log(`Temporary password (shown once, change it at first login):`)
  console.log(`  ${tempPassword}`)
} catch (error) {
  if (userId) await db.delete(user).where(eq(user.id, userId)) // cascades to account
  fail(
    `could not create the account (${(error as Error).message.slice(0, 120)})`,
  )
}
