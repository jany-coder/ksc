// A URL slug for an activity, e.g. "শীতবস্ত্র বিতরণ" -> "শীতবস্ত্র-বিতরণ-k3x9a2".
// Bengali letters are kept (modern browsers and search engines handle them); only
// punctuation is dropped. A random suffix is always added, so two activities with
// the same title never collide and no lookup is needed to stay unique.
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function randomSuffix(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(
    bytes,
    (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length],
  ).join('')
}

export function makeSlug(
  title: string,
  suffix: string = randomSuffix(),
): string {
  const base = title
    .normalize('NFC')
    .toLowerCase()
    // keep letters, marks (Bengali vowel signs are marks), numbers; the rest -> space
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
    .replace(/-+$/, '')
  return base ? `${base}-${suffix}` : `karjokrom-${suffix}`
}
