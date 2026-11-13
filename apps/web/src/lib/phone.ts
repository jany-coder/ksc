// The stored form of a phone number is 01XXXXXXXXX: 11 digits, no spaces, no
// country code. Run every phone number through this on BOTH signup and login,
// so "+8801712345678" and "017-1234-5678" resolve to the same account.
//
// Keep the pattern in step with the members_phone_format CHECK constraint in
// db/schema/members.ts, which rejects anything this function would not return.
const NORMALISED = /^01[3-9][0-9]{8}$/

const BENGALI_ZERO = 0x09e6 // '০'

/** Returns the stored form, or null if the input is not a Bangladeshi mobile number. */
export function normalizePhone(input: string): string | null {
  // Bengali digits ০-৯ -> 0-9. Members will type them on a Bengali keyboard.
  // Then drop everything that is not a digit: spaces, dashes, dots, brackets, '+'.
  let digits = input
    .replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - BENGALI_ZERO))
    .replace(/\D/g, '')

  // Country code, written with a 00 prefix or without it.
  if (digits.startsWith('00880')) digits = digits.slice(5)
  else if (digits.startsWith('880')) digits = digits.slice(3)

  // "+880 1712..." drops the trunk 0; put it back.
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`

  return NORMALISED.test(digits) ? digits : null
}
