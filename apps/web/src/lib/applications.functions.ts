import { createServerFn } from '@tanstack/react-start'

import { applicationFormSchema } from './application-form.ts'
import { submitApplication } from './applications.server.ts'

// Public: deliberately no permission check, because visitors apply without an
// account. Safe because it can only ever INSERT a 'pending' member with role
// 'member', and it returns nothing about existing members.
export const submitApplicationFn = createServerFn({ method: 'POST' })
  .validator(applicationFormSchema)
  .handler(({ data }) => submitApplication(data))
