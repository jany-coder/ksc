import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button, buttonVariants } from '../../../components/ui/button.tsx'
import { CheckboxField } from '../../../components/ui/checkbox-field.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { Label } from '../../../components/ui/label.tsx'
import { NativeSelect } from '../../../components/ui/native-select.tsx'
import {
  BLOOD_GROUPS,
  MEMBER_STATUSES,
  STATUS_LABEL,
  bloodLabel,
} from '../../../lib/member-options.ts'
import { memberFormSchema } from '../../../lib/member-form.ts'
import type { MemberFormInput } from '../../../lib/member-form.ts'
import { createMemberFn } from '../../../lib/members.functions.ts'
import { can } from '../../../lib/permissions.ts'
import { cn } from '../../../lib/utils.ts'

export const Route = createFileRoute('/admin/members/new')({
  head: () => ({ meta: [{ title: 'নতুন সদস্য — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'members.write'))
      throw redirect({ to: '/admin/members' })
  },
  component: NewMemberPage,
})

// The consent wording. It is a legal statement, so it lives in ONE place and
// should be reviewed by the club (and a lawyer, if the club wants one) before
// real members are added. Nobody involved in building this is a lawyer.
const CONSENT_LABEL =
  'সদস্য নিজে তাঁর নাম, ফোন নম্বর, ঠিকানা ও রক্তের গ্রুপ ক্লাবের রেকর্ডে রাখার সম্মতি দিয়েছেন।'
const CONSENT_NOTE = 'এই তথ্য শুধু অ্যাডমিন দেখতে পান, ওয়েবসাইটে কোথাও প্রকাশ হয় না।'

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

function NewMemberPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormInput>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      bloodGroup: '',
      address: '',
      area: '',
      occupation: '',
      status: 'active',
      willingToDonate: false,
      consent: false,
    },
  })

  async function onSubmit(values: MemberFormInput) {
    setFormError(null)
    try {
      const result = await createMemberFn({ data: values })
      if (!result.ok) {
        if (result.code === 'PHONE_TAKEN') {
          setError('phone', {
            message: 'এই নম্বরে আগে থেকেই একজন সদস্য আছেন (আর্কাইভ করা হলেও)।',
          })
          setFocus('phone')
        } else {
          setFormError('তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।')
        }
        return
      }
      // The list is cached for 30 s; without this the new member would be
      // missing from it until then.
      await queryClient.invalidateQueries({ queryKey: ['members'] })
      await navigate({ to: '/admin/members' })
    } catch {
      setFormError('সদস্য যোগ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  const invalid = (name: keyof MemberFormInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof MemberFormInput) =>
    errors[name] ? `${name}-error` : undefined

  return (
    <main className="px-4 py-6 md:p-6">
      <Link
        to="/admin/members"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        সদস্য তালিকায় ফিরুন
      </Link>
      <h1 className="text-2xl font-semibold">নতুন সদস্য</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        তারকা-চিহ্নিত ঘরগুলো আবশ্যক। বাকিগুলো পরে সম্পাদনা করা যাবে।
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-5 max-w-2xl space-y-5 rounded-[10px] border border-border bg-card p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">নাম *</Label>
            <Input
              id="name"
              autoComplete="off"
              aria-invalid={invalid('name')}
              aria-describedby={describedBy('name')}
              {...register('name')}
            />
            <FieldError id="name-error" message={errors.name?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">মোবাইল নম্বর *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              aria-invalid={invalid('phone')}
              aria-describedby={describedBy('phone')}
              {...register('phone')}
            />
            <FieldError id="phone-error" message={errors.phone?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="off"
              aria-invalid={invalid('email')}
              aria-describedby={describedBy('email')}
              {...register('email')}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bloodGroup">রক্তের গ্রুপ</Label>
            <NativeSelect
              id="bloodGroup"
              aria-invalid={invalid('bloodGroup')}
              {...register('bloodGroup')}
            >
              <option value="">জানা নেই</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {bloodLabel(g)}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address">ঠিকানা (ঐচ্ছিক)</Label>
            <Input
              id="address"
              autoComplete="off"
              aria-invalid={invalid('address')}
              aria-describedby={describedBy('address')}
              {...register('address')}
            />
            <FieldError id="address-error" message={errors.address?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="area">এলাকা (ঐচ্ছিক)</Label>
            <Input
              id="area"
              autoComplete="off"
              aria-invalid={invalid('area')}
              aria-describedby={describedBy('area')}
              {...register('area')}
            />
            <FieldError id="area-error" message={errors.area?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="occupation">পেশা (ঐচ্ছিক)</Label>
            <Input
              id="occupation"
              autoComplete="off"
              aria-invalid={invalid('occupation')}
              aria-describedby={describedBy('occupation')}
              {...register('occupation')}
            />
            <FieldError
              id="occupation-error"
              message={errors.occupation?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">অবস্থা</Label>
            <NativeSelect id="status" {...register('status')}>
              {MEMBER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex items-end pb-1.5">
            <CheckboxField
              label="রক্ত দিতে রাজি"
              {...register('willingToDonate')}
            />
          </div>
        </div>

        <div
          className={cn(
            'rounded-lg border bg-background p-3.5',
            errors.consent ? 'border-red-300' : 'border-border',
          )}
        >
          <CheckboxField
            label={CONSENT_LABEL}
            description={CONSENT_NOTE}
            aria-invalid={invalid('consent')}
            aria-describedby={describedBy('consent')}
            {...register('consent')}
          />
          <FieldError id="consent-error" message={errors.consent?.message} />
        </div>

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
            {isSubmitting ? 'অপেক্ষা করুন…' : 'সদস্য যোগ করুন'}
          </Button>
          <Link
            to="/admin/members"
            className={buttonVariants({ variant: 'outline' })}
          >
            বাতিল
          </Link>
        </div>
      </form>
    </main>
  )
}
