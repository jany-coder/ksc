// The allowed values for member filters, as plain arrays with no database
// imports, so the browser can use them without pulling Drizzle into the bundle.
// member-options.test.ts checks they still match the database enums.
export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const
export const MEMBER_STATUSES = ['active', 'pending', 'suspended'] as const

export type BloodGroup = (typeof BLOOD_GROUPS)[number]
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export const STATUS_LABEL: Record<MemberStatus, string> = {
  active: 'সক্রিয়',
  pending: 'অপেক্ষমাণ',
  suspended: 'স্থগিত',
}

// The database stores a hyphen ("O-"); the design shows a proper minus ("O−").
export function bloodLabel(group: BloodGroup): string {
  return group.replace('-', '−')
}
