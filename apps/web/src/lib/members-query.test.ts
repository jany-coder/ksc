import { describe, expect, it } from 'vitest'

import { escapeLike, membersSearchSchema } from './members-query.ts'

describe('escapeLike', () => {
  it('escapes the LIKE wildcards and the escape character itself', () => {
    expect(escapeLike('50%')).toBe('50\\%')
    expect(escapeLike('a_b')).toBe('a\\_b')
    expect(escapeLike('a\\b')).toBe('a\\\\b')
  })

  it('leaves ordinary text, including Bengali, unchanged', () => {
    expect(escapeLike('রহিম')).toBe('রহিম')
    expect(escapeLike('Rahim 017')).toBe('Rahim 017')
  })
})

describe('membersSearchSchema', () => {
  it('defaults to page 1 with no filters', () => {
    expect(membersSearchSchema.parse({})).toEqual({ page: 1 })
  })

  it('accepts valid filters', () => {
    expect(
      membersSearchSchema.parse({
        status: 'active',
        blood: 'O+',
        q: ' রহিম ',
        page: 3,
      }),
    ).toEqual({ status: 'active', blood: 'O+', q: 'রহিম', page: 3 })
  })

  it('falls back instead of failing on bad values', () => {
    const parsed = membersSearchSchema.parse({
      status: 'deleted',
      blood: 'Z+',
      page: -4,
    })
    expect(parsed.status).toBeUndefined()
    expect(parsed.blood).toBeUndefined()
    expect(parsed.page).toBe(1)
  })

  it('rejects a non-integer page by falling back to 1', () => {
    expect(membersSearchSchema.parse({ page: 2.5 }).page).toBe(1)
  })
})
