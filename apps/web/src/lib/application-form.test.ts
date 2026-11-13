import { describe, expect, it } from 'vitest'

import { applicationFormSchema } from './application-form.ts'

const valid = {
  name: 'রহিম উদ্দিন',
  phone: '017-1234-5678',
  bloodGroup: 'O+' as const,
  address: '',
  area: '',
  occupation: '',
  willingToDonate: true,
  consent: true,
  website: '',
}

describe('applicationFormSchema', () => {
  it('accepts a complete application', () => {
    expect(applicationFormSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a phone written with country code or dashes', () => {
    for (const phone of ['+8801712345678', '8801712345678', '01712345678'])
      expect(applicationFormSchema.safeParse({ ...valid, phone }).success).toBe(
        true,
      )
  })

  it('rejects an invalid phone', () => {
    expect(
      applicationFormSchema.safeParse({ ...valid, phone: '12345' }).success,
    ).toBe(false)
  })

  it('requires consent', () => {
    expect(
      applicationFormSchema.safeParse({ ...valid, consent: false }).success,
    ).toBe(false)
  })

  it('accepts a blank blood group but not an invented one', () => {
    expect(
      applicationFormSchema.safeParse({ ...valid, bloodGroup: '' }).success,
    ).toBe(true)
    expect(
      applicationFormSchema.safeParse({ ...valid, bloodGroup: 'C+' }).success,
    ).toBe(false)
  })
})
