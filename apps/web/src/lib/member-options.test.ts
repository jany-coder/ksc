import { describe, expect, it } from 'vitest'

import { bloodGroup, memberStatus } from '../db/schema/enums.ts'
import {
  BLOOD_GROUPS,
  MEMBER_STATUSES,
  STATUS_LABEL,
  bloodLabel,
} from './member-options.ts'

describe('member options', () => {
  it('match the database enums, so a filter can never name a missing value', () => {
    expect([...BLOOD_GROUPS]).toEqual([...bloodGroup.enumValues])
    expect([...MEMBER_STATUSES]).toEqual([...memberStatus.enumValues])
  })

  it('has a Bengali label for every status', () => {
    for (const status of MEMBER_STATUSES)
      expect(STATUS_LABEL[status]).toBeTruthy()
  })

  it('shows the minus sign for negative blood groups only', () => {
    expect(bloodLabel('O-')).toBe('O−')
    expect(bloodLabel('AB-')).toBe('AB−')
    expect(bloodLabel('A+')).toBe('A+')
  })
})
