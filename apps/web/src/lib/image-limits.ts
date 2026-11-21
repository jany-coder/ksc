// Limits and checks for gallery photos. Pure code (no database, no Cloudflare),
// so the browser, the server and the tests can all use it.
//
// R2's free allowance is 10 GB a month. We stop uploads well before that, so
// the club never gets near a paid tier: warn at 6 GB, refuse new uploads at 8 GB.
// (Decimal GB, 1 GB = 1,000,000,000 bytes: the smaller number, so the safer one.)
const GB = 1_000_000_000
export const STORAGE_FREE_BYTES = 10 * GB
export const STORAGE_WARN_BYTES = 6 * GB
export const STORAGE_STOP_BYTES = 8 * GB

// Per-file ceilings. A 1600px WebP is about 250 KB and an 800px one about 100 KB,
// so these leave room but still refuse anything that skipped the resizing.
// How many photos the homepage shows, and so how many an admin can pick.
export const HOME_PHOTO_COUNT = 6

export const MAX_FULL_BYTES = 1_000_000
export const MAX_THUMB_BYTES = 200_000
export const MAX_DIMENSION = 8000

// A member's photo: cropped square in the browser, stored in two sizes. 600px
// for the profile and the drawer, 128px for the members list (a 28px circle
// there, so 128 is sharp even on a 3x phone screen and only a few KB).
export const MEMBER_PHOTO_WIDTH = 600
export const MAX_MEMBER_PHOTO_BYTES = 200_000
export const MEMBER_PHOTO_SMALL_WIDTH = 128
export const MAX_MEMBER_PHOTO_SMALL_BYTES = 30_000

/**
 * Where a member's photo lives in R2. The small copy sits beside the big one
 * with "-sm" added, so the database keeps a single key for both.
 */
export const memberPhotoKey = (memberId: string, version: string) =>
  `members/${memberId}/${version}.webp`
export const smallPhotoKey = (key: string) => key.replace(/\.webp$/, '-sm.webp')
/** The random part of the key; it changes with every new photo. */
export const photoVersion = (key: string) =>
  key.slice(key.lastIndexOf('/') + 1, -'.webp'.length)

export const FULL_WIDTH = 1600
// Thumbnails were 400px until November 2026; new uploads are 800px so grids
// stay sharp. Older ones are still 400px, which is why imageSrcSet() below
// describes every thumbnail as 400px wide (the safe guess).
export const THUMB_WIDTH = 800
const OLDEST_THUMB_WIDTH = 400

export type StorageState = 'ok' | 'warn' | 'full'

export function storageState(usedBytes: number): StorageState {
  if (usedBytes >= STORAGE_STOP_BYTES) return 'full'
  if (usedBytes >= STORAGE_WARN_BYTES) return 'warn'
  return 'ok'
}

/** A WebP file starts with "RIFF", four size bytes, then "WEBP". */
export function looksLikeWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false
  const text = (from: number) =>
    String.fromCharCode(...bytes.subarray(from, from + 4))
  return text(0) === 'RIFF' && text(8) === 'WEBP'
}

export function isValidDimension(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_DIMENSION
}

/** 3_500_000 -> "৩.৫ MB" in Bengali, "3.5 MB" in English. */
export function formatBytes(bytes: number, lang: 'bn' | 'en' = 'bn'): string {
  const number = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    maximumFractionDigits: 1,
  })
  if (bytes >= GB) return `${number.format(bytes / GB)} GB`
  if (bytes >= 1_000_000) return `${number.format(bytes / 1_000_000)} MB`
  return `${number.format(Math.max(1, Math.round(bytes / 1000)))} KB`
}

/** The URL of a stored photo. One place, so it can later point at a public bucket. */
export function imageUrl(id: string, size: 'thumb' | 'full'): string {
  return `/api/media/${id}/${size}`
}

/**
 * The srcset for a photo in a grid: the thumbnail, plus the large version for
 * screens that need more pixels than the thumbnail has (sharp phone and laptop
 * screens). The browser picks, using the `sizes` given next to it.
 * `fullWidth` is the large version's real width; a photo smaller than a
 * thumbnail needs no srcset at all.
 */
export function imageSrcSet(
  id: string,
  fullWidth: number = FULL_WIDTH,
): string | undefined {
  if (fullWidth <= OLDEST_THUMB_WIDTH) return undefined
  return `${imageUrl(id, 'thumb')} ${OLDEST_THUMB_WIDTH}w, ${imageUrl(id, 'full')} ${fullWidth}w`
}
