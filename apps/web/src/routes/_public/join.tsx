import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../../components/ui/button.tsx'
import { CheckboxField } from '../../components/ui/checkbox-field.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { NativeSelect } from '../../components/ui/native-select.tsx'
import { applicationFormSchema } from '../../lib/application-form.ts'
import type { ApplicationFormInput } from '../../lib/application-form.ts'
import { submitApplicationFn } from '../../lib/applications.functions.ts'
import { BLOOD_GROUPS, bloodLabel } from '../../lib/member-options.ts'

export const Route = createFileRoute('/_public/join')({
  head: () => ({
    meta: [
      { title: 'সদস্য হওয়ার আবেদন — কলমা সোশ্যাল ক্লাব' },
      {
        name: 'description',
        content:
          'কলমা সোশ্যাল ক্লাবের সদস্য হতে আবেদন করুন। আপনার তথ্য শুধু ক্লাবের অ্যাডমিন দেখতে পান।',
      },
    ],
  }),
  component: JoinPage,
})

// The consent wording. It is a legal statement, so it lives in ONE place and
// should be reviewed by the club (and a lawyer, if the club wants one) before
// the form goes live. Nobody involved in building this is a lawyer.
const CONSENT_LABEL =
  'আমি নিজের নাম, ফোন নম্বর, ঠিকানা ও রক্তের গ্রুপ ক্লাবের রেকর্ডে রাখার সম্মতি দিচ্ছি।'
const CONSENT_NOTE =
  'এই তথ্য শুধু ক্লাবের অ্যাডমিন দেখতে পান। ওয়েবসাইটে বা অন্য সদস্যদের কাছে কোথাও প্রকাশ হয় না।'

// Larger than the admin panel: the audience includes older readers.
const fieldClass = 'h-11 text-[17px]'
const labelClass = 'text-[17px]'

function FieldError({
  id,
  message,
}: {
  id: string
  message?: string | undefined
}) {
  return message ? (
    <p id={id} className="text-base text-red-700">
      {message}
    </p>
  ) : null
}

function JoinPage() {
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      bloodGroup: '',
      address: '',
      area: '',
      occupation: '',
      willingToDonate: false,
      consent: false,
      website: '',
    },
  })

  async function onSubmit(values: ApplicationFormInput) {
    setFormError(null)
    try {
      const result = await submitApplicationFn({ data: values })
      if (result.ok) {
        setDone(true)
        return
      }
      setFormError(
        result.code === 'TRY_LATER'
          ? 'এখন অনেক আবেদন জমা পড়ছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।'
          : 'তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।',
      )
    } catch {
      setFormError('আবেদন জমা দেওয়া গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  const invalid = (name: keyof ApplicationFormInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof ApplicationFormInput) =>
    errors[name] ? `${name}-error` : undefined

  if (done) {
    return (
      <main className="mx-auto w-full max-w-[720px] px-5 py-14 md:px-8 md:py-20">
        <h1 className="mb-4 text-[28px] font-bold text-brand-deep md:text-[40px]">
          আবেদন পেয়েছি
        </h1>
        <p className="mb-6 text-[17px] leading-[1.7] text-copy md:text-[19px]">
          ধন্যবাদ। আমাদের কমিটি যাচাই করে আপনার সাথে যোগাযোগ করবে।
        </p>
        <Link
          to="/"
          className="text-[17px] font-semibold text-primary underline-offset-2 hover:underline"
        >
          হোমপেজে ফিরে যান
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-3 text-[28px] font-bold text-brand-deep md:text-[40px]">
        সদস্য হওয়ার আবেদন
      </h1>
      <p className="mb-8 text-[17px] leading-[1.7] text-copy md:text-[19px]">
        ফর্মটি পূরণ করুন। আমাদের কমিটি যাচাই করে আপনার সাথে যোগাযোগ করবে। * চিহ্নিত
        ঘর পূরণ করা আবশ্যক।
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5 rounded-[10px] border border-line bg-card p-5 md:p-[30px]"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name" className={labelClass}>
            নাম *
          </Label>
          <Input
            id="name"
            autoComplete="name"
            className={fieldClass}
            aria-invalid={invalid('name')}
            aria-describedby={describedBy('name')}
            {...register('name')}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className={labelClass}>
            মোবাইল নম্বর *
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className={fieldClass}
            aria-invalid={invalid('phone')}
            aria-describedby={describedBy('phone')}
            {...register('phone')}
          />
          <FieldError id="phone-error" message={errors.phone?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bloodGroup" className={labelClass}>
            রক্তের গ্রুপ
          </Label>
          <NativeSelect
            id="bloodGroup"
            className={fieldClass}
            {...register('bloodGroup')}
          >
            <option value="">জানি না / বলতে চাই না</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {bloodLabel(g)}
              </option>
            ))}
          </NativeSelect>
        </div>

        <CheckboxField
          label="প্রয়োজনে রক্ত দিতে আগ্রহী"
          className="text-[17px]"
          {...register('willingToDonate')}
        />

        <div className="space-y-1.5">
          <Label htmlFor="address" className={labelClass}>
            ঠিকানা
          </Label>
          <Input
            id="address"
            autoComplete="street-address"
            className={fieldClass}
            aria-invalid={invalid('address')}
            aria-describedby={describedBy('address')}
            {...register('address')}
          />
          <FieldError id="address-error" message={errors.address?.message} />
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="min-w-0 flex-[1_1_220px] space-y-1.5">
            <Label htmlFor="area" className={labelClass}>
              এলাকা
            </Label>
            <Input
              id="area"
              className={fieldClass}
              aria-invalid={invalid('area')}
              aria-describedby={describedBy('area')}
              {...register('area')}
            />
            <FieldError id="area-error" message={errors.area?.message} />
          </div>
          <div className="min-w-0 flex-[1_1_220px] space-y-1.5">
            <Label htmlFor="occupation" className={labelClass}>
              পেশা
            </Label>
            <Input
              id="occupation"
              className={fieldClass}
              aria-invalid={invalid('occupation')}
              aria-describedby={describedBy('occupation')}
              {...register('occupation')}
            />
            <FieldError
              id="occupation-error"
              message={errors.occupation?.message}
            />
          </div>
        </div>

        {/* Honeypot: pushed off-screen rather than display:none, which simple
            bots detect. Hidden from screen readers and the Tab key. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-[9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            ওয়েবসাইট (ফাঁকা রাখুন)
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register('website')}
            />
          </label>
        </div>

        <div className="space-y-1.5 rounded-lg border border-line bg-panel p-4">
          <CheckboxField
            label={CONSENT_LABEL}
            description={CONSENT_NOTE}
            className="text-[17px]"
            aria-invalid={invalid('consent')}
            aria-describedby={describedBy('consent')}
            {...register('consent')}
          />
          <FieldError id="consent-error" message={errors.consent?.message} />
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-12 self-start text-[17px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'অপেক্ষা করুন…' : 'আবেদন জমা দিন'}
        </Button>
      </form>
    </main>
  )
}
