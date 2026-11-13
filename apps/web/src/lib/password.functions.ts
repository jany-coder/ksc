import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { changePasswordSchema } from './password-rules.ts'
import { changeOwnPassword } from './password.server.ts'

// Called from the /change-password form. The schema check here gives the
// caller a typed input; changeOwnPassword validates again on the server side
// because the endpoint can be called without our form.
export const changePasswordFn = createServerFn({ method: 'POST' })
  .validator(changePasswordSchema)
  .handler(({ data }) => changeOwnPassword(getRequestHeaders(), data))
