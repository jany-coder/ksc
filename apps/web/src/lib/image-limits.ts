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

// Per-file ceilings. A 1600px WebP is about 250 KB and a 400px one about 30 KB,
// so these leave room but still refuse anything that skipped the resizing.
export const MAX_FULL_BYTES = 1_000_000
export const MAX_THUMB_BYTES = 200_000
export const MAX_DIMENSION = 8000

export const FULL_WIDTH = 1600
export const THUMB_WIDTH = 400

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
