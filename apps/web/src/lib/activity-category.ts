import { z } from 'zod'

import type { Lang } from './i18n/core.ts'

// The kinds of activity, as the browser and the server both see them. Pure
// code (no database), so forms and tests can use it too.

export type ActivityCategory = {
  id: string
  nameBn: string
  nameEn: string
  // No longer offered for new activities; old ones keep it.
  hidden: boolean
  // How many activities use it (a kind in use cannot be deleted).
  activityCount: number
}

/** The add / edit form for a kind. */
export const categoryFormSchema = z.object({
  nameBn: z
    .string()
    .trim()
    .min(1, 'val.categoryBnRequired')
    .max(40, 'val.categoryTooLong'),
  // English letters only: it also becomes part of new activities' URLs.
  nameEn: z
    .string()
    .trim()
    .min(1, 'val.categoryEnRequired')
    .max(40, 'val.categoryTooLong')
    .regex(/^[A-Za-z][A-Za-z0-9 &,'-]*$/, 'val.categoryEnLatin'),
})
export type CategoryFormInput = z.infer<typeof categoryFormSchema>

/** The kind's name in the reader's language. */
export function categoryName(
  category: { nameBn: string; nameEn: string },
  lang: Lang,
): string {
  return lang === 'en' ? category.nameEn : category.nameBn
}

/** "Relief and support" -> "relief-and-support", for activity URLs. */
export function categorySlug(nameEn: string): string {
  return nameEn
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-')
}

/**
 * The kinds to offer in the activity form: the visible ones, plus the one the
 * activity already has even if it was hidden since (else saving would drop it).
 */
export function selectableCategories<T extends { id: string; hidden: boolean }>(
  categories: T[],
  currentId: string,
): T[] {
  return categories.filter((c) => !c.hidden || c.id === currentId)
}
