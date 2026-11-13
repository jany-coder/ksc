import { describe, expect, it } from 'vitest'

import {
  STORAGE_FREE_BYTES,
  STORAGE_STOP_BYTES,
  STORAGE_WARN_BYTES,
  formatBytes,
  imageUrl,
  isValidDimension,
  looksLikeWebp,
  storageState,
} from './image-limits.ts'

describe('storage limits', () => {
  it('stops uploads well below the free allowance', () => {
    expect(STORAGE_STOP_BYTES).toBeLessThan(STORAGE_FREE_BYTES)
    expect(STORAGE_WARN_BYTES).toBeLessThan(STORAGE_STOP_BYTES)
  })

  it('moves ok -> warn -> full at the thresholds', () => {
    expect(storageState(0)).toBe('ok')
    expect(storageState(STORAGE_WARN_BYTES - 1)).toBe('ok')
    expect(storageState(STORAGE_WARN_BYTES)).toBe('warn')
    expect(storageState(STORAGE_STOP_BYTES - 1)).toBe('warn')
    expect(storageState(STORAGE_STOP_BYTES)).toBe('full')
  })
})

describe('looksLikeWebp', () => {
  const webp = new Uint8Array([
    ...Array.from('RIFF', (c) => c.charCodeAt(0)),
    1,
    2,
    3,
    4,
    ...Array.from('WEBP', (c) => c.charCodeAt(0)),
  ])

  it('accepts a WebP header', () => {
    expect(looksLikeWebp(webp)).toBe(true)
  })

  it('rejects other formats and short input', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0])
    expect(looksLikeWebp(png)).toBe(false)
    expect(looksLikeWebp(new Uint8Array([82, 73]))).toBe(false)
  })
})

describe('isValidDimension', () => {
  it('accepts whole numbers in range only', () => {
    expect(isValidDimension(1600)).toBe(true)
    expect(isValidDimension(0)).toBe(false)
    expect(isValidDimension(8001)).toBe(false)
    expect(isValidDimension(10.5)).toBe(false)
    expect(isValidDimension(Number.NaN)).toBe(false)
  })
})

describe('formatBytes / imageUrl', () => {
  it('picks a sensible unit', () => {
    expect(formatBytes(250_000)).toContain('KB')
    expect(formatBytes(3_500_000)).toContain('MB')
    expect(formatBytes(6_000_000_000)).toContain('GB')
  })

  it('builds the media URL', () => {
    expect(imageUrl('abc', 'thumb')).toBe('/api/media/abc/thumb')
  })
})
