import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { z } from 'zod'

import { changePasswordSchema } from './password-rules.ts'
import { changeOwnPassword, resetMemberPassword } from './password.server.ts'
import { requirePermission } from './session.server.ts'

// Called from the /change-password form. The schema check here gives the
// caller a typed input; changeOwnPassword validates again on the server side
// because the endpoint can be called without our form.
export const changePasswordFn = createServerFn({ method: 'POST' })
  .validator(changePasswordSchema)
  .handler(({ data }) => changeOwnPassword(getRequestHeaders(), data))

export const resetMemberPasswordFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const actor = await requirePermission('members.write')
    return resetMemberPassword(actor, data.id)
  })
