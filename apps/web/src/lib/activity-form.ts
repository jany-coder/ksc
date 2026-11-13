import { z } from 'zod'

// The "new activity" form, shared by the browser and the server. Optional fields
// arrive as empty strings from the form and become NULL when saved.
export const ACTIVITY_CATEGORIES = [
  'রক্তদান',
  'ত্রাণ ও সহায়তা',
  'শিক্ষা',
  'খেলাধুলা',
  'সভা',
] as const

// The English key of each category, used to build a readable English URL slug.
export const ACTIVITY_CATEGORY_SLUG: Record<
  (typeof ACTIVITY_CATEGORIES)[number],
  string
> = {
  রক্তদান: 'blood-donation',
  'ত্রাণ ও সহায়তা': 'relief',
  শিক্ষা: 'education',
  খেলাধুলা: 'sports',
  সভা: 'meeting',
}

export const ACTIVITY_STATUSES = ['draft', 'published'] as const
export const ACTIVITY_STATUS_LABEL = {
  draft: 'খসড়া',
  published: 'প্রকাশিত',
} as const

// "2026-02-31" has the right shape but is not a day: check it really exists.
export function isRealDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d
  )
}

export const activityFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'শিরোনাম লিখুন')
    .max(150, 'শিরোনাম অনেক বেশি লম্বা'),
  description: z.string().trim().max(5000, 'বিবরণ অনেক বেশি লম্বা'),
  category: z.union([z.enum(ACTIVITY_CATEGORIES), z.literal('')]),
  eventDate: z
    .string()
    .refine((v) => v === '' || isRealDate(v), 'সঠিক তারিখ দিন'),
  eventTime: z
    .string()
    .refine(
      (v) => v === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      'সঠিক সময় দিন',
    ),
  location: z.string().trim().max(200, 'স্থানের নাম অনেক বেশি লম্বা'),
  status: z.enum(ACTIVITY_STATUSES),
  featured: z.boolean(),
  // A gallery photo shown on the activity's card; '' means none.
  coverImageId: z.union([z.uuid(), z.literal('')]),
})

export type ActivityFormInput = z.infer<typeof activityFormSchema>
