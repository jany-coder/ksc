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
import { createActivityFn } from '../../../lib/activities.functions.ts'
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABEL,
  activityFormSchema,
} from '../../../lib/activity-form.ts'
import type { ActivityFormInput } from '../../../lib/activity-form.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/activities/new')({
  head: () => ({ meta: [{ title: 'নতুন কার্যক্রম — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  component: NewActivityPage,
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

function NewActivityPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      eventDate: '',
      eventTime: '',
      location: '',
      status: 'draft',
      featured: false,
    },
  })
  const publishing = watch('status') === 'published'

  async function onSubmit(values: ActivityFormInput) {
    setFormError(null)
    try {
      const result = await createActivityFn({ data: values })
      if (!result.ok) {
        setFormError('তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।')
        return
      }
      // Cached lists would not show the new activity until they expire.
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      await navigate({ to: '/admin/activities' })
    } catch {
      setFormError('কার্যক্রম সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  const invalid = (name: keyof ActivityFormInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof ActivityFormInput) =>
    errors[name] ? `${name}-error` : undefined

  return (
    <main className="px-4 py-6 md:p-6">
      <nav aria-label="পথ" className="mb-3 text-sm text-muted-foreground">
        <Link to="/admin/activities" className="hover:text-foreground">
          কার্যক্রম
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">নতুন</span>
      </nav>
      <h1 className="text-2xl font-semibold">নতুন কার্যক্রম</h1>

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
                : publishing
                  ? 'প্রকাশ করুন'
                  : 'খসড়া রাখুন'}
            </Button>
            <Link
              to="/admin/activities"
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
