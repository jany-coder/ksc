import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  NOTICE_STATUSES,
  NOTICE_STATUS_LABEL,
  noticeFormSchema,
} from '../../lib/notice-form.ts'
import type { NoticeFormInput } from '../../lib/notice-form.ts'
import { Button, buttonVariants } from '../ui/button.tsx'
import { CheckboxField } from '../ui/checkbox-field.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'
import { NativeSelect } from '../ui/native-select.tsx'
import { Textarea } from '../ui/textarea.tsx'

// The notice form, shared by "new" and "edit".
export type NoticeFormResult = { ok: true } | { ok: false; message: string }

function FieldError({
  id,
  message,
}: {
  id: string
  message?: string | undefined
}) {
  return message ? (
    <p id={id} className="text-sm text-red-700">
      {message}
    </p>
  ) : null
}

const card = 'rounded-[10px] border border-border bg-card p-5'

export function NoticeForm({
  initial,
  onSubmit,
  submitLabel,
  extra,
}: {
  initial: NoticeFormInput
  onSubmit: (values: NoticeFormInput) => Promise<NoticeFormResult>
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
  } = useForm<NoticeFormInput>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: initial,
  })
  const publishing = watch('status') === 'published'

  async function submit(values: NoticeFormInput) {
    setFormError(null)
    try {
      const result = await onSubmit(values)
      if (!result.ok) setFormError(result.message)
    } catch {
      setFormError('নোটিশ সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  const invalid = (name: keyof NoticeFormInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof NoticeFormInput) =>
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
              autoComplete="off"
              aria-invalid={invalid('title')}
              aria-describedby={describedBy('title')}
              {...register('title')}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">বিবরণ *</Label>
            <Textarea
              id="body"
              rows={7}
              aria-invalid={invalid('body')}
              aria-describedby={describedBy('body')}
              {...register('body')}
            />
            <FieldError id="body-error" message={errors.body?.message} />
          </div>
        </section>
      </div>

      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="text-[15px] font-semibold">প্রকাশের সেটিং</h2>
          <div className="space-y-1.5">
            <Label htmlFor="status">অবস্থা</Label>
            <NativeSelect id="status" {...register('status')}>
              {NOTICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {NOTICE_STATUS_LABEL[s]}
                </option>
              ))}
            </NativeSelect>
            <p className="text-[13px] text-muted-foreground">
              {publishing
                ? 'প্রকাশিত হলে সাথে সাথে ওয়েবসাইটে দেখা যাবে।'
                : 'খসড়া শুধু অ্যাডমিন দেখতে পান।'}
            </p>
          </div>
          <CheckboxField
            label="জরুরি নোটিশ (উপরে লাল চিহ্নসহ দেখাবে)"
            {...register('urgent')}
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
            to="/admin/notices"
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
