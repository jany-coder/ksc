import '@tanstack/react-start/server-only'

import { and, eq, gt, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { auditLog, members } from '../db/schema/index.ts'
import { applicationFormSchema } from './application-form.ts'
import { normalizePhone } from './phone.ts'

// At most this many applications per hour across the whole site. A crude brake
// against a script flooding the member list; a CAPTCHA would be the real fix.
export const MAX_APPLICATIONS_PER_HOUR = 20

export type ApplyResult =
  { ok: true } | { ok: false; code: 'INVALID_INPUT' | 'TRY_LATER' }

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

const blankToNull = (text: string) => (text === '' ? null : text)

/**
 * Save a public application as a 'pending' member for the committee to review.
 * Public: no login, so it returns almost nothing.
 *
 * Privacy: if the phone number is already registered we still answer "received".
 * Otherwise anyone could type a number into this form to find out whether that
 * person is a club member, which would leak exactly what CLAUDE.md section 3
 * says must stay private.
 */
export async function submitApplication(input: unknown): Promise<ApplyResult> {
  const parsed = applicationFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  const v = parsed.data
  const phone = normalizePhone(v.phone)
  if (!phone) return { ok: false, code: 'INVALID_INPUT' }

  // Honeypot filled: a bot. Pretend it worked so it learns nothing.
  if (v.website.trim() !== '') return { ok: true }

  const [recent] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(members)
    .where(
      and(
        eq(members.status, 'pending'),
        gt(members.joinedAt, sql`now() - interval '1 hour'`),
      ),
    )
  if ((recent?.n ?? 0) >= MAX_APPLICATIONS_PER_HOUR)
    return { ok: false, code: 'TRY_LATER' }

  const id = crypto.randomUUID()
  try {
    await db.batch([
      db.insert(members).values({
        id,
        name: v.name,
        phone,
        bloodGroup: v.bloodGroup === '' ? null : v.bloodGroup,
        address: blankToNull(v.address),
        area: blankToNull(v.area),
        occupation: blankToNull(v.occupation),
        role: 'member', // never taken from the form
        status: 'pending', // an admin approves it
        willingToDonate: v.willingToDonate,
        // The database clock, not a time sent by the browser.
        consentGivenAt: sql`now()`,
      }),
      // No actor: the applicant is not signed in. No personal data in the log.
      db.insert(auditLog).values({
        action: 'member.apply',
        targetType: 'member',
        targetId: id,
      }),
    ])
  } catch (error) {
    if (!isUniqueViolation(error)) throw error
    // Phone already registered: say nothing about it (see above).
  }
  return { ok: true }
}
