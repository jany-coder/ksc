import '@tanstack/react-start/server-only'

// Cloudflare Turnstile: a free, privacy-friendly "are you a person" check.
// It is OFF until the club sets the secret key (wrangler secret put
// TURNSTILE_SECRET_KEY) AND the site key (VITE_TURNSTILE_SITE_KEY at build
// time). Set only one of them and the form would lock everyone out, so always
// set both together. Without the secret key nothing is checked.
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

/** True if the visitor passed the check (or the check is switched off). */
export async function verifyTurnstile(token: unknown): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || token === '') return false
  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false // cannot reach Cloudflare: treat as not verified
  }
}
