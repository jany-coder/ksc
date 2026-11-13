import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

// Browser-side helper for signing in and out. Same plugins as the server.
export const authClient = createAuthClient({
  plugins: [usernameClient()],
})
