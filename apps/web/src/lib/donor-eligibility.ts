import { daysBetween } from './datetime.ts'

// When a donor may give blood again. The common rule in Bangladesh (and the
// WHO's): men every 3 months, women every 4. The club should confirm these;
// they are the only numbers to change if its rule differs. With no gender
// recorded, the longer gap is used, to be safe.
export const DONATION_GAP_DAYS = { male: 90, female: 120 } as const

export type DonorGender = 'male' | 'female' | 'other' | null

export function donationGapDays(gender: DonorGender): number {
  return gender === 'male' ? DONATION_GAP_DAYS.male : DONATION_GAP_DAYS.female
}

/**
 * Days until the donor may give again, counted from `today` ("YYYY-MM-DD").
 * Zero or less: they may give now. Never donated (no date): they may give
 * now, and sort before everyone else.
 */
export function daysUntilEligible(
  lastDonation: string | null,
  gender: DonorGender,
  today: string,
): number {
  if (!lastDonation) return Number.NEGATIVE_INFINITY
  return donationGapDays(gender) - daysBetween(lastDonation, today)
}

export const canDonateNow = (daysUntil: number) => daysUntil <= 0
