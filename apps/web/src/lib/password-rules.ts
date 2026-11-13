import { z } from 'zod'

// Rules for a NEW password. The browser form and the server function both use
// this schema, so they cannot drift apart. Length only: forcing capitals or
// symbols pushes people toward weak, hard-to-remember passwords. The bounds
// match Better Auth's own (8 to 128), which would reject anything else anyway.
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 128

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'val.currentPasswordRequired'),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'val.passwordMin')
      .max(MAX_PASSWORD_LENGTH, 'val.passwordTooLong'),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: 'val.passwordSame',
    path: ['newPassword'],
  })
