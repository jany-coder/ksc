import { z } from 'zod'

import { isRealDate } from './activity-form.ts'
import { BLOOD_GROUPS, MEMBER_STATUSES } from './member-options.ts'
import { profileShape, rowToProfile } from './member-profile.ts'
import type { ProfileRow } from './member-profile.ts'
import { normalizePhone } from './phone.ts'

// The "new member" form. The browser and the server both use this schema, so
// they cannot disagree about what a valid member is. Optional fields arrive as
// empty strings from the form and are turned into NULL when saved.
export const memberFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'val.nameRequired')
    .max(100, 'val.nameTooLong'),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, 'val.phoneInvalid'),
  email: z
    .string()
    .trim()
    .max(254)
    .refine(
      (v) => v === '' || z.email().safeParse(v).success,
      'val.emailInvalid',
    ),
  // '' means "not known": the database column is nullable.
  bloodGroup: z.union([z.enum(BLOOD_GROUPS), z.literal('')]),
  // Personal details and address (lib/member-profile.ts).
  ...profileShape,
  status: z.enum(MEMBER_STATUSES),
  willingToDonate: z.boolean(),
  // Required: a member cannot be saved without recorded consent
  // (Personal Data Protection Act, 2026; CLAUDE.md section 3).
  consent: z.boolean().refine((v) => v, 'val.consentMember'),
})

export type MemberFormInput = z.infer<typeof memberFormSchema>

// Editing an existing member. Same fields as "new", except:
//  - no phone: the number is the member's unique identity (and an admin's
//    sign-in name), so it is never changed here;
//  - no consent: it was recorded when the member joined and is not re-asked here;
//  - no status: suspending / activating has its own buttons (and its own log entry);
//  - plus the date of the last blood donation.
export const memberEditSchema = memberFormSchema
  .omit({ phone: true, status: true, consent: true })
  .extend({
    // '' means "none yet".
    lastDonationDate: z
      .string()
      .refine((v) => v === '' || isRealDate(v), 'val.dateInvalid'),
  })

export type MemberEditInput = z.infer<typeof memberEditSchema>

/** The saved member (as the detail drawer gets it) -> the edit form's starting values. */
export function memberToEditValues(
  member: ProfileRow & {
    name: string
    email: string | null
    bloodGroup: MemberEditInput['bloodGroup'] | null
    willingToDonate: boolean
    lastDonationDate: string | null
  },
): MemberEditInput {
  return {
    name: member.name,
    email: member.email ?? '',
    bloodGroup: member.bloodGroup ?? '',
    ...rowToProfile(member),
    willingToDonate: member.willingToDonate,
    lastDonationDate: member.lastDonationDate ?? '',
  }
}
