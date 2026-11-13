import { createServerFn } from '@tanstack/react-start'

import { getCurrentMember } from './session.server.ts'

// Server functions are the bridge: the browser calls these like normal async
// functions, but the body runs on the server, where it can read the session
// cookie and the database. Route guards use this to ask "who is signed in?".
// It returns only id, role and the must-change flag, never personal data.
export const getCurrentMemberFn = createServerFn({ method: 'GET' }).handler(
  () => getCurrentMember(),
)
