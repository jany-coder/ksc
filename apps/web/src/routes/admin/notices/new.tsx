import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, buttonVariants } from '../../../components/ui/button.tsx'
import { CheckboxField } from '../../../components/ui/checkbox-field.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { Label } from '../../../components/ui/label.tsx'
import { NativeSelect } from '../../../components/ui/native-select.tsx'
import { Textarea } from '../../../components/ui/textarea.tsx'
import {
  NOTICE_STATUSES,
  NOTICE_STATUS_LABEL,
  noticeFormSchema,
} from '../../../lib/notice-form.ts'
import type { NoticeFormInput } from '../../../lib/notice-form.ts'
import { createNoticeFn } from '../../../lib/notices.functions.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/notices/new')({
  head: () => ({ meta: [{ title: 'নতুন নোটিশ — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  component: NewNoticePage,
})

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

function NewNoticePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormInput>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: { title: '', body: '', urgent: false, status: 'draft' },
  })
  const publishing = watch('status') === 'published'

  async function onSubmit(values: NoticeFormInput) {
    setFormError(null)
    try {
      const result = await createNoticeFn({ data: values })
      if (!result.ok) {
        setFormError('তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।')
        return
      }
      // Cached lists would not show the new notice until they expire.
      await queryClient.invalidateQueries({ queryKey: ['notices'] })
      await navigate({ to: '/admin/notices' })
    } catch {
      setFormError('নোটিশ সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  const invalid = (name: keyof NoticeFormInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof NoticeFormInput) =>
    errors[name] ? `${name}-error` : undefined

  return (
    <main className="px-4 py-6 md:p-6">
      <nav aria-label="পথ" className="mb-3 text-sm text-muted-foreground">
        <Link to="/admin/notices" className="hover:text-foreground">
          নোটিশ
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">নতুন</span>
      </nav>
      <h1 className="text-2xl font-semibold">নতুন নোটিশ</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
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
                : publishing
                  ? 'প্রকাশ করুন'
                  : 'খসড়া রাখুন'}
            </Button>
            <Link
              to="/admin/notices"
              className={buttonVariants({ variant: 'outline' })}
            >
              বাতিল
            </Link>
          </div>
        </div>
      </form>
    </main>
  )
}
