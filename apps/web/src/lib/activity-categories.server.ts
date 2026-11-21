import '@tanstack/react-start/server-only'

import { asc, count, eq } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { activities, activityCategories } from '../db/schema/index.ts'
import { categoryFormSchema } from './activity-category.ts'
import type { ActivityCategory } from './activity-category.ts'

// The kinds of activity. Reading: any admin (requirePermission('content.write'),
// the form needs the list). Changing: requirePermission('categories.manage'),
// super admin only. Callers check first; this file does not.

function pgCode(error: unknown): string | undefined {
  const e = error as { code?: string; cause?: { code?: string } } | null
  return e?.code ?? e?.cause?.code
}

/** Every kind, hidden ones too, in the order they were added, with usage counts. */
export async function listCategories(): Promise<ActivityCategory[]> {
  return db
    .select({
      id: activityCategories.id,
      nameBn: activityCategories.nameBn,
      nameEn: activityCategories.nameEn,
      hidden: activityCategories.hidden,
      activityCount: count(activities.id),
    })
    .from(activityCategories)
    .leftJoin(activities, eq(activities.categoryId, activityCategories.id))
    .groupBy(activityCategories.id)
    .orderBy(asc(activityCategories.createdAt), asc(activityCategories.id))
}

export type CategoryResult =
  | { ok: true; id: string }
  | { ok: false; code: 'INVALID_INPUT' | 'NAME_TAKEN' | 'NOT_FOUND' }

/** Add a kind. */
export async function createCategory(input: unknown): Promise<CategoryResult> {
  const parsed = categoryFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  try {
    const [row] = await db
      .insert(activityCategories)
      .values(parsed.data)
      .returning({ id: activityCategories.id })
    return { ok: true, id: row!.id }
  } catch (error) {
    // The unique index on the lower-cased names.
    if (pgCode(error) === '23505') return { ok: false, code: 'NAME_TAKEN' }
    throw error
  }
}

/**
 * Rename a kind, or hide / show it. Every activity of that kind shows the new
 * name at once: they point at the kind, they do not copy its name.
 */
export async function updateCategory(
  id: string,
  input: unknown,
  hidden: boolean,
): Promise<CategoryResult> {
  const parsed = categoryFormSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'INVALID_INPUT' }
  try {
    const rows = await db.batch([
      db
        .update(activityCategories)
        .set({ ...parsed.data, hidden })
        .where(eq(activityCategories.id, id))
        .returning({ id: activityCategories.id }),
      // DEPRECATED copy of the Bengali name, for the version of the site that
      // is live now (see db/schema/activities.ts).
      db
        .update(activities)
        .set({ category: parsed.data.nameBn })
        .where(eq(activities.categoryId, id)),
    ])
    return rows[0].length > 0
      ? { ok: true, id }
      : { ok: false, code: 'NOT_FOUND' }
  } catch (error) {
    if (pgCode(error) === '23505') return { ok: false, code: 'NAME_TAKEN' }
    throw error
  }
}

export type DeleteCategoryResult =
  { ok: true } | { ok: false; code: 'IN_USE' | 'NOT_FOUND' }

/** Delete a kind no activity uses. One in use is refused: hide it instead. */
export async function deleteCategory(
  id: string,
): Promise<DeleteCategoryResult> {
  try {
    const rows = await db
      .delete(activityCategories)
      .where(eq(activityCategories.id, id))
      .returning({ id: activityCategories.id })
    return rows.length > 0 ? { ok: true } : { ok: false, code: 'NOT_FOUND' }
  } catch (error) {
    // ON DELETE RESTRICT: an activity still points at it. The database itself
    // refuses, so two admins at once cannot slip past a check made here.
    if (pgCode(error) === '23503') return { ok: false, code: 'IN_USE' }
    throw error
  }
}
