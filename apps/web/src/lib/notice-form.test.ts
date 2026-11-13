import { describe, expect, it } from 'vitest'

import { noticeFormSchema } from './notice-form.ts'

const valid = {
  title: 'রক্তদান ক্যাম্প',
  body: 'শুক্রবার সকালে ক্লাব প্রাঙ্গণে।',
  urgent: false,
  status: 'draft' as const,
}

describe('noticeFormSchema', () => {
  it('accepts a complete notice', () => {
    expect(noticeFormSchema.safeParse(valid).success).toBe(true)
  })

  it('trims the title and body', () => {
    const r = noticeFormSchema.parse({
      ...valid,
      title: '  হ্যালো  ',
      body: ' বিবরণ ',
    })
    expect(r.title).toBe('হ্যালো')
    expect(r.body).toBe('বিবরণ')
  })

  it('rejects a blank title or body', () => {
    expect(noticeFormSchema.safeParse({ ...valid, title: '   ' }).success).toBe(
      false,
    )
    expect(noticeFormSchema.safeParse({ ...valid, body: '' }).success).toBe(
      false,
    )
  })

  it('rejects an over-long title or body', () => {
    expect(
      noticeFormSchema.safeParse({ ...valid, title: 'ক'.repeat(151) }).success,
    ).toBe(false)
    expect(
      noticeFormSchema.safeParse({ ...valid, body: 'ক'.repeat(2001) }).success,
    ).toBe(false)
  })

  it('rejects a status outside draft / published', () => {
    expect(
      noticeFormSchema.safeParse({ ...valid, status: 'archived' }).success,
    ).toBe(false)
  })
})
