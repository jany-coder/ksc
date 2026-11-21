import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  categoryName,
  selectableCategories,
} from '../../lib/activity-category.ts'
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABEL_KEY,
  activityFormSchema,
} from '../../lib/activity-form.ts'
import type { ActivityFormInput } from '../../lib/activity-form.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'
import { Button, buttonVariants } from '../ui/button.tsx'
import { CheckboxField } from '../ui/checkbox-field.tsx'
import { FieldError } from '../ui/field-error.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'
import { NativeSelect } from '../ui/native-select.tsx'
import { Textarea } from '../ui/textarea.tsx'
import { CategoryDialog, categoriesQuery } from './category-dialog.tsx'

// The activity form, shared by "new" and "edit": same fields, same checks, only
// the starting values and what happens on save differ.
export type ActivityFormResult = { ok: true } | { ok: false; message: string }

const card = 'rounded-[10px] border border-border bg-card p-5'

export function ActivityForm({
  initial,
  photoCount,
  onSubmit,
  submitLabel,
  extra,
  canManageKinds,
}: {
  initial: ActivityFormInput
  // How many photos the activity has; null for a new one (photos are added
  // after the first save). Only used for a reminder, never to block.
  photoCount: number | null
  onSubmit: (values: ActivityFormInput) => Promise<ActivityFormResult>
  // Overrides the "draft / publish" button text (used by the edit page).
  submitLabel?: string
  // Extra cards for the side column, e.g. the delete button.
  extra?: ReactNode
  // Super admin: may add a new kind from here.
  canManageKinds: boolean
}) {
  const t = useT()
  const lang = useLang()
  const [formError, setFormError] = useState<string | null>(null)
  const [addingKind, setAddingKind] = useState(false)
  const [newKindId, setNewKindId] = useState<string | null>(null)
  // Loaded by the page's loader, so this never waits.
  const { data: kinds } = useSuspenseQuery(categoriesQuery())
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: initial,
  })
  const publishing = watch('status') === 'published'

  // Pick a just-added kind, once the reloaded list has drawn its <option>
  // (a <select> cannot take a value it has no option for).
  useEffect(() => {
    if (newKindId && kinds.some((k) => k.id === newKindId)) {
      setValue('categoryId', newKindId, { shouldDirty: true })
      setNewKindId(null)
    }
  }, [newKindId, kinds, setValue])

  async function submit(values: ActivityFormInput) {
    setFormError(null)
    try {
      const result = await onSubmit(values)
      if (!result.ok) setFormError(result.message)
    } catch {
      setFormError(t('act.errSave'))
    }
  }

  const invalid = (name: keyof ActivityFormInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof ActivityFormInput) =>
    errors[name] ? `${name}-error` : undefined

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="mt-5 flex flex-wrap items-start gap-[18px]"
    >
      <div className="flex min-w-0 flex-[999_1_440px] flex-col gap-4">
        <section className={`${card} flex flex-col gap-4`}>
          <div className="space-y-1.5">
            <Label htmlFor="title">{t('act.fTitle')}</Label>
            <Input
              id="title"
              placeholder={t('act.fTitlePh')}
              autoComplete="off"
              aria-invalid={invalid('title')}
              aria-describedby={describedBy('title')}
              {...register('title')}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </div>

          <div className="flex flex-wrap gap-3.5">
            <div className="min-w-0 flex-[1_1_150px] space-y-1.5">
              <Label htmlFor="eventDate">{t('act.fDate')}</Label>
              <Input
                id="eventDate"
                type="date"
                aria-invalid={invalid('eventDate')}
                aria-describedby={describedBy('eventDate')}
                {...register('eventDate')}
              />
              <FieldError
                id="eventDate-error"
                message={errors.eventDate?.message}
              />
            </div>
            <div className="min-w-0 flex-[1_1_120px] space-y-1.5">
              <Label htmlFor="eventTime">{t('act.fTime')}</Label>
              <Input
                id="eventTime"
                type="time"
                aria-invalid={invalid('eventTime')}
                aria-describedby={describedBy('eventTime')}
                {...register('eventTime')}
              />
              <FieldError
                id="eventTime-error"
                message={errors.eventTime?.message}
              />
            </div>
            <div className="min-w-0 flex-[2_1_200px] space-y-1.5">
              <Label htmlFor="location">{t('act.fPlace')}</Label>
              <Input
                id="location"
                placeholder={t('act.fPlacePh')}
                autoComplete="off"
                aria-invalid={invalid('location')}
                aria-describedby={describedBy('location')}
                {...register('location')}
              />
              <FieldError
                id="location-error"
                message={errors.location?.message}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t('act.fDescription')}</Label>
            <Textarea
              id="description"
              rows={7}
              placeholder={t('act.fDescriptionPh')}
              aria-invalid={invalid('description')}
              aria-describedby={describedBy('description')}
              {...register('description')}
            />
            <FieldError
              id="description-error"
              message={errors.description?.message}
            />
          </div>
        </section>
      </div>

      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-[15px] font-semibold">
            {t('a.publishSettings')}
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="status">{t('a.status')}</Label>
            <NativeSelect id="status" {...register('status')}>
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(ACTIVITY_STATUS_LABEL_KEY[s])}
                </option>
              ))}
            </NativeSelect>
            <p className="text-[13px] text-muted-foreground">
              {publishing ? t('a.publishNote') : t('a.draftNote')}
            </p>
            {/* A gentle reminder, not a rule: publishing still works. */}
            {publishing && photoCount === 0 && (
              <p
                role="status"
                className="rounded-md border border-yellow-300 bg-yellow-50 px-2.5 py-1.5 text-[13px] text-yellow-900"
              >
                {t('act.noPhotosYet')}
              </p>
            )}
            {publishing && photoCount === null && (
              <p className="text-[13px] text-muted-foreground">
                {t('act.photosAfterSave')}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">{t('act.fType')}</Label>
            <NativeSelect id="categoryId" {...register('categoryId')}>
              <option value="">{t('act.fTypeNone')}</option>
              {selectableCategories(kinds, initial.categoryId).map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryName(c, lang)}
                </option>
              ))}
            </NativeSelect>
            {canManageKinds && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ms-2 text-primary"
                onClick={() => setAddingKind(true)}
              >
                <Plus aria-hidden="true" />
                {t('kind.add')}
              </Button>
            )}
            {addingKind && (
              <CategoryDialog
                onClose={() => setAddingKind(false)}
                onSaved={setNewKindId}
              />
            )}
          </div>
          <CheckboxField label={t('act.fFeatured')} {...register('featured')} />
        </section>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('a.wait')
              : (submitLabel ??
                (publishing ? t('a.publish') : t('a.saveDraft')))}
          </Button>
          <Link
            to="/admin/activities"
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('a.cancel')}
          </Link>
        </div>

        {extra}
      </div>
    </form>
  )
}
