import { z } from 'zod'

import { BLOOD_GROUPS } from './member-options.ts'
import { normalizePhone } from './phone.ts'

// The PUBLIC membership application. Visitors fill it in, so it asks for less
// than the admin form: no status, no email. Optional fields arrive as empty
// strings and become NULL when saved.
const optionalText = z.string().trim().max(200, 'val.tooLong')

export const applicationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'val.nameRequired')
    .max(100, 'val.nameTooLong'),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, 'val.phoneInvalid'),
  bloodGroup: z.union([z.enum(BLOOD_GROUPS), z.literal('')]),
  address: optionalText,
  area: optionalText,
  occupation: optionalText,
  willingToDonate: z.boolean(),
  // Required: no application is saved without recorded consent
  // (Personal Data Protection Act, 2026; CLAUDE.md section 3).
  consent: z.boolean().refine((v) => v, 'val.consentApply'),
  // Honeypot: a field real people never see, so never fill. Bots fill every
  // field they find. The server quietly drops any application where it has text.
  website: z.string().max(200),
})

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>
