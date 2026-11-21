import { zodResolver } from '@hookform/resolvers/zod'
import { queryOptions, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'

import {
  createCategoryFn,
  listCategoriesFn,
  updateCategoryFn,
} from '../../lib/activity-categories.functions.ts'
import { categoryFormSchema } from '../../lib/activity-category.ts'
import type {
  ActivityCategory,
  CategoryFormInput,
} from '../../lib/activity-category.ts'
import { useT } from '../../lib/i18n/index.tsx'
import { Button } from '../ui/button.tsx'
import { FieldError } from '../ui/field-error.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'

/** Every kind of activity, hidden ones too. Shared by the form, list and page. */
export const categoriesQuery = () =>
  queryOptions({
    queryKey: ['activity-categories'],
    queryFn: () => listCategoriesFn(),
  })

/**
 * Add a kind, or rename one (super admin). Opened from the activity form's
 * "New type" button and from the types page, so both look and behave the same.
 *
 * Drawn into <body> through a portal: the activity form is a <form> itself, and
 * a form inside a form is not allowed in HTML.
 */
export function CategoryDialog({
  editing,
  onClose,
  onSaved,
}: {
  // The kind being renamed; absent to add a new one.
  editing?: ActivityCategory
  onClose: () => void
  // The saved kind's id (the activity form selects it at once).
  onSaved?: (id: string) => void
}) {
  const t = useT()
  const queryClient = useQueryClient()
  const dialog = useRef<HTMLDialogElement>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: editing
      ? { nameBn: editing.nameBn, nameEn: editing.nameEn }
      : { nameBn: '', nameEn: '' },
  })

  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
  }, [])

  async function save(values: CategoryFormInput) {
    setFormError(null)
    try {
      const result = editing
        ? await updateCategoryFn({
            data: { id: editing.id, values, hidden: editing.hidden },
          })
        : await createCategoryFn({ data: values })
      if (!result.ok) {
        setFormError(
          result.code === 'NAME_TAKEN' ? t('kind.errTaken') : t('kind.errSave'),
        )
        return
      }
      // The kinds list, and the activities list that shows their names.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['activity-categories'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
      ])
      onSaved?.(result.id)
      dialog.current?.close()
    } catch {
      setFormError(t('kind.errSave'))
    }
  }

  const field = (name: keyof CategoryFormInput) => ({
    id: `kind-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name]
      ? `kind-${name}-error`
      : name === 'nameEn'
        ? 'kind-nameEn-note'
        : undefined,
  })

  return createPortal(
    <dialog
      ref={dialog}
      aria-labelledby="kind-dialog-title"
      onCancel={(e) => {
        if (isSubmitting) e.preventDefault()
      }}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[10px] border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      <form
        noValidate
        // Stop here: React passes events up through the portal to the
        // activity form, which would otherwise submit too.
        onSubmit={(e) => {
          e.stopPropagation()
          void handleSubmit(save)(e)
        }}
        className="flex flex-col gap-4 p-5"
      >
        <h2 id="kind-dialog-title" className="text-lg font-semibold">
          {editing ? t('kind.editTitle') : t('kind.addTitle')}
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="kind-nameBn">{t('kind.nameBn')}</Label>
          <Input
            {...field('nameBn')}
            autoComplete="off"
            placeholder={t('kind.nameBnPh')}
            {...register('nameBn')}
          />
          <FieldError id="kind-nameBn-error" message={errors.nameBn?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kind-nameEn">{t('kind.nameEn')}</Label>
          <Input
            {...field('nameEn')}
            autoComplete="off"
            lang="en"
            placeholder={t('kind.nameEnPh')}
            {...register('nameEn')}
          />
          <FieldError id="kind-nameEn-error" message={errors.nameEn?.message} />
          <p
            id="kind-nameEn-note"
            className="text-[13px] text-muted-foreground"
          >
            {t('kind.nameEnNote')}
          </p>
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-9"
            disabled={isSubmitting}
            onClick={() => dialog.current?.close()}
          >
            {t('a.cancel')}
          </Button>
          <Button type="submit" className="h-11 sm:h-9" disabled={isSubmitting}>
            {isSubmitting ? t('a.wait') : t('a.save')}
          </Button>
        </div>
      </form>
    </dialog>,
    document.body,
  )
}
