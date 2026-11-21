import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { categoryFormSchema } from './activity-category.ts'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './activity-categories.server.ts'
import { requirePermission } from './session.server.ts'

// Any admin can read the kinds (the activity form needs them). Only the super
// admin can change them. The check is the first line of each function.
export const listCategoriesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission('content.write')
    return listCategories()
  },
)

export const createCategoryFn = createServerFn({ method: 'POST' })
  .validator(categoryFormSchema)
  .handler(async ({ data }) => {
    await requirePermission('categories.manage')
    return createCategory(data)
  })

export const updateCategoryFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({ id: z.uuid(), values: categoryFormSchema, hidden: z.boolean() }),
  )
  .handler(async ({ data }) => {
    await requirePermission('categories.manage')
    return updateCategory(data.id, data.values, data.hidden)
  })

export const deleteCategoryFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('categories.manage')
    return deleteCategory(data.id)
  })
