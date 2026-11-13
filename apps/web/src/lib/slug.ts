// A URL slug for an activity. Always plain English: only a-z, 0-9 and hyphens.
// Titles are Bengali, and we deliberately do NOT transliterate or translate
// them (that produces misleading, ugly text). Instead:
//   - if the title contains English words, use them:  "Winter Clothes" -> winter-clothes-k3x9a2
//   - otherwise use the English key of the category and the date:
//                                                      blood-donation-2026-12-20-k3x9a2
//   - with neither, just:                              activity-k3x9a2
// A random suffix is always added, so two activities never collide and no lookup
// is needed to stay unique.
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function randomSuffix(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(
    bytes,
    (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length],
  ).join('')
}

export type SlugParts = {
  title: string
  /** English key of the category, e.g. 'blood-donation'. */
  categorySlug?: string | undefined
  /** ISO date, e.g. '2026-12-20'. */
  date?: string | undefined
}

export function makeSlug(
  parts: SlugParts,
  suffix: string = randomSuffix(),
): string {
  // English words in the title: everything that is not a-z / 0-9 is a separator,
  // so Bengali letters simply fall away.
  const words = parts.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-')
    .slice(0, 50)
    .replace(/-+$/, '')

  const base =
    words ||
    [parts.categorySlug || 'activity', parts.date].filter(Boolean).join('-')

  return `${base}-${suffix}`
}
