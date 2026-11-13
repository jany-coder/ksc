import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  TURNSTILE_SITE_KEY,
  Turnstile,
} from '../../components/public/turnstile.tsx'
import { Button } from '../../components/ui/button.tsx'
import { CheckboxField } from '../../components/ui/checkbox-field.tsx'
import { FieldError } from '../../components/ui/field-error.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Label } from '../../components/ui/label.tsx'
import { NativeSelect } from '../../components/ui/native-select.tsx'
import { applicationFormSchema } from '../../lib/application-form.ts'
import type { ApplicationFormInput } from '../../lib/application-form.ts'
import { submitApplicationFn } from '../../lib/applications.functions.ts'
import { useLocaleParams, useT } from '../../lib/i18n/index.tsx'
import { tFor } from '../../lib/i18n/messages.ts'
import { BLOOD_GROUPS, bloodLabel } from '../../lib/member-options.ts'

export const Route = createFileRoute('/{-$locale}/join')({
  head: ({ params }) => {
    const t = tFor(params.locale === 'en' ? 'en' : 'bn')
    return {
      meta: [
        { title: t('apply.pageTitle') },
        { name: 'description', content: t('apply.description') },
      ],
    }
  },
  component: JoinPage,
})

// The consent wording lives in the messages (apply.consent / apply.consentNote),
// in ONE place, and should be reviewed by the club (and a lawyer, if the club
// wants one) before the form goes live. Nobody building this is a lawyer.

// Larger than the admin panel: the audience includes older readers.
const fieldClass = 'h-11 text-[17px]'
const labelClass = 'text-[17px]'

function JoinPage() {
  const t = useT()
  const localeParams = useLocaleParams()
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

  const [token, setToken] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)

  async function onSubmit(values: ApplicationFormInput) {
    setFormError(null)
    try {
      const result = await submitApplicationFn({
        data: { form: values, challengeToken: token ?? undefined },
      })
      if (result.ok) {
        setDone(true)
        return
      }
      setResetKey((n) => n + 1) // a token works once: ask for a new one
      setFormError(
        result.code === 'TRY_LATER'
          ? t('apply.errorTryLater')
          : result.code === 'CHALLENGE_FAILED'
            ? t('apply.errorChallenge')
            : t('apply.errorInvalid'),
      )
    } catch {
      setFormError(t('apply.errorNetwork'))
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
          {t('apply.doneTitle')}
        </h1>
        <p className="mb-6 text-[17px] leading-[1.7] text-copy md:text-[19px]">
          {t('apply.doneText')}
        </p>
        <Link
          to="/{-$locale}"
          params={localeParams}
          className="text-[17px] font-semibold text-primary underline-offset-2 hover:underline"
        >
          {t('apply.backHome')}
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-3 text-[28px] font-bold text-brand-deep md:text-[40px]">
        {t('apply.title')}
      </h1>
      <p className="mb-8 text-[17px] leading-[1.7] text-copy md:text-[19px]">
        {t('apply.lead')}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5 rounded-[10px] border border-line bg-card p-5 md:p-[30px]"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name" className={labelClass}>
            {t('apply.name')}
          </Label>
          <Input
            id="name"
            autoComplete="name"
            className={fieldClass}
            aria-invalid={invalid('name')}
            aria-describedby={describedBy('name')}
            {...register('name')}
          />
          <FieldError
            className="text-base text-red-700"
            id="name-error"
            message={errors.name?.message}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className={labelClass}>
            {t('apply.phone')}
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
          <FieldError
            className="text-base text-red-700"
            id="phone-error"
            message={errors.phone?.message}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bloodGroup" className={labelClass}>
            {t('apply.blood')}
          </Label>
          <NativeSelect
            id="bloodGroup"
            className={fieldClass}
            {...register('bloodGroup')}
          >
            <option value="">{t('apply.bloodUnknown')}</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {bloodLabel(g)}
              </option>
            ))}
          </NativeSelect>
        </div>

        <CheckboxField
          label={t('apply.willing')}
          className="text-[17px]"
          {...register('willingToDonate')}
        />

        <div className="space-y-1.5">
          <Label htmlFor="address" className={labelClass}>
            {t('apply.address')}
          </Label>
          <Input
            id="address"
            autoComplete="street-address"
            className={fieldClass}
            aria-invalid={invalid('address')}
            aria-describedby={describedBy('address')}
            {...register('address')}
          />
          <FieldError
            className="text-base text-red-700"
            id="address-error"
            message={errors.address?.message}
          />
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="min-w-0 flex-[1_1_220px] space-y-1.5">
            <Label htmlFor="area" className={labelClass}>
              {t('apply.area')}
            </Label>
            <Input
              id="area"
              className={fieldClass}
              aria-invalid={invalid('area')}
              aria-describedby={describedBy('area')}
              {...register('area')}
            />
            <FieldError
              className="text-base text-red-700"
              id="area-error"
              message={errors.area?.message}
            />
          </div>
          <div className="min-w-0 flex-[1_1_220px] space-y-1.5">
            <Label htmlFor="occupation" className={labelClass}>
              {t('apply.occupation')}
            </Label>
            <Input
              id="occupation"
              className={fieldClass}
              aria-invalid={invalid('occupation')}
              aria-describedby={describedBy('occupation')}
              {...register('occupation')}
            />
            <FieldError
              className="text-base text-red-700"
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
            {t('apply.honeypot')}
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
            label={t('apply.consent')}
            description={t('apply.consentNote')}
            className="text-[17px]"
            aria-invalid={invalid('consent')}
            aria-describedby={describedBy('consent')}
            {...register('consent')}
          />
          <FieldError
            className="text-base text-red-700"
            id="consent-error"
            message={errors.consent?.message}
          />
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700"
          >
            {formError}
          </p>
        )}

        <Turnstile onToken={setToken} resetKey={resetKey} />

        <Button
          type="submit"
          size="lg"
          className="h-12 self-start text-[17px]"
          disabled={isSubmitting || (Boolean(TURNSTILE_SITE_KEY) && !token)}
        >
          {isSubmitting ? t('apply.wait') : t('apply.submit')}
        </Button>
      </form>
    </main>
  )
}
