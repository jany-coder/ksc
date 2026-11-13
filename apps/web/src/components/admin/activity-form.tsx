import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABEL,
  activityFormSchema,
} from '../../lib/activity-form.ts'
import type { ActivityFormInput } from '../../lib/activity-form.ts'
import { imageUrl } from '../../lib/image-limits.ts'
import { Button, buttonVariants } from '../ui/button.tsx'
import { CheckboxField } from '../ui/checkbox-field.tsx'
import { FieldError } from '../ui/field-error.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'
import { NativeSelect } from '../ui/native-select.tsx'
import { Textarea } from '../ui/textarea.tsx'

// The activity form, shared by "new" and "edit": same fields, same checks, only
// the starting values and what happens on save differ.
export type ActivityFormResult = { ok: true } | { ok: false; message: string }

const card = 'rounded-[10px] border border-border bg-card p-5'

export function ActivityForm({
  initial,
  photos,
  onSubmit,
  submitLabel,
  extra,
}: {
  initial: ActivityFormInput
  // Gallery photos the activity's cover can be picked from.
  photos: { id: string; width: number; height: number }[]
  onSubmit: (values: ActivityFormInput) => Promise<ActivityFormResult>
  // Overrides the "draft / publish" button text (used by the edit page).
  submitLabel?: string
  // Extra cards for the side column, e.g. the delete button.
  extra?: ReactNode
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: initial,
  })
  const publishing = watch('status') === 'published'

  async function submit(values: ActivityFormInput) {
    setFormError(null)
    try {
      const result = await onSubmit(values)
      if (!result.ok) setFormError(result.message)
    } catch {
      setFormError('কার্যক্রম সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
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
            <Label htmlFor="title">শিরোনাম *</Label>
            <Input
              id="title"
              placeholder="যেমন: ফ্রি রক্তের গ্রুপ নির্ণয় ক্যাম্প"
              autoComplete="off"
              aria-invalid={invalid('title')}
              aria-describedby={describedBy('title')}
              {...register('title')}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </div>

          <div className="flex flex-wrap gap-3.5">
            <div className="min-w-0 flex-[1_1_150px] space-y-1.5">
              <Label htmlFor="eventDate">তারিখ</Label>
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
              <Label htmlFor="eventTime">সময়</Label>
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
              <Label htmlFor="location">স্থান</Label>
              <Input
                id="location"
                placeholder="ক্লাব প্রাঙ্গণ, কলমা"
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
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              rows={7}
              placeholder="কার্যক্রমটি কী নিয়ে, কারা অংশ নিতে পারবেন, কী আনতে হবে — সংক্ষেপে লিখুন।"
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

        {/* Cover photo: pick one of the gallery photos. Each choice is a real
            radio button inside a <label>, so it works with keyboard and screen
            readers; the photo is just its picture. */}
        <fieldset className={card}>
          <legend className="px-1 text-[15px] font-semibold">কভার ছবি</legend>
          {photos.length > 0 ? (
            <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-border p-1 text-center text-xs text-muted-foreground has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:focus-visible]:outline-2">
                <input
                  type="radio"
                  value=""
                  className="sr-only"
                  {...register('coverImageId')}
                />
                ছবি ছাড়া
              </label>
              {photos.map((photo, index) => (
                <label
                  key={photo.id}
                  className="block cursor-pointer overflow-hidden rounded-lg border border-border has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:focus-visible]:outline-2"
                >
                  <input
                    type="radio"
                    value={photo.id}
                    aria-label={`ছবি ${index + 1}`}
                    className="sr-only"
                    {...register('coverImageId')}
                  />
                  <img
                    src={imageUrl(photo.id, 'thumb')}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              গ্যালারিতে এখনো কোনো ছবি নেই।{' '}
              <Link
                to="/admin/gallery"
                className="font-medium text-primary hover:underline"
              >
                আগে ছবি যোগ করুন
              </Link>
              ।
            </p>
          )}
          <FieldError
            id="coverImageId-error"
            message={errors.coverImageId?.message}
          />
        </fieldset>
      </div>

      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-[15px] font-semibold">প্রকাশের সেটিং</h2>
          <div className="space-y-1.5">
            <Label htmlFor="status">অবস্থা</Label>
            <NativeSelect id="status" {...register('status')}>
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ACTIVITY_STATUS_LABEL[s]}
                </option>
              ))}
            </NativeSelect>
            <p className="text-[13px] text-muted-foreground">
              {publishing
                ? 'প্রকাশিত হলে সাথে সাথে ওয়েবসাইটে দেখা যাবে।'
                : 'খসড়া শুধু অ্যাডমিন দেখতে পান।'}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">ধরন</Label>
            <NativeSelect id="category" {...register('category')}>
              <option value="">বেছে নেওয়া হয়নি</option>
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect>
          </div>
          <CheckboxField
            label="হোমপেজের উপরে দেখান"
            {...register('featured')}
          />
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
              ? 'অপেক্ষা করুন…'
              : (submitLabel ?? (publishing ? 'প্রকাশ করুন' : 'খসড়া রাখুন'))}
          </Button>
          <Link
            to="/admin/activities"
            className={buttonVariants({ variant: 'outline' })}
          >
            বাতিল
          </Link>
        </div>

        {extra}
      </div>
    </form>
  )
}
