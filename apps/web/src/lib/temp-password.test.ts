import { describe, expect, it } from 'vitest'

import { generateTempPassword } from './temp-password.ts'

describe('generateTempPassword', () => {
  it('is 16 URL-safe characters, long enough for the password rules', () => {
    const password = generateTempPassword()
    expect(password).toMatch(/^[A-Za-z0-9_-]{16}$/)
  })

  it('is different every time', () => {
    const seen = new Set(Array.from({ length: 50 }, generateTempPassword))
    expect(seen.size).toBe(50)
  })
})
