// A random temporary password for an admin to hand to a member. 12 random bytes
// are 96 bits of entropy, written as 16 URL-safe characters (A-Z a-z 0-9 - _).
// Uses the Web Crypto API, which exists in both Node and Cloudflare Workers.
export const TEMP_PASSWORD_BYTES = 12

export function generateTempPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TEMP_PASSWORD_BYTES))
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}
