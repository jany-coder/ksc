import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useT } from '../../lib/i18n/index.tsx'
import { BLOOD_GROUPS, bloodLabel } from '../../lib/member-options.ts'
import { memberEditSchema } from '../../lib/member-form.ts'
import type { MemberEditInput } from '../../lib/member-form.ts'
import { Button, buttonVariants } from '../ui/button.tsx'
import { CheckboxField } from '../ui/checkbox-field.tsx'
import { FieldError } from '../ui/field-error.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'
import { NativeSelect } from '../ui/native-select.tsx'

export type MemberEditResult = { ok: true } | { ok: false; message: string }

/**
 * Edit an existing member. The phone number is shown but locked: it is the
 * member's identity (see memberEditSchema), so it is never part of this form.
 */
export function MemberEditForm({
  initial,
  phone,
  onSubmit,
}: {
  initial: MemberEditInput
  // Shown read-only.
  phone: string
  onSubmit: (values: MemberEditInput) => Promise<MemberEditResult>
}) {
  const t = useT()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberEditInput>({
    resolver: zodResolver(memberEditSchema),
    defaultValues: initial,
  })

  async function submit(values: MemberEditInput) {
    setFormError(null)
    try {
      const result = await onSubmit(values)
      if (!result.ok) setFormError(result.message)
    } catch {
      setFormError(t('memberEdit.errSave'))
    }
  }

  const invalid = (name: keyof MemberEditInput) =>
    errors[name] ? true : undefined
  const describedBy = (name: keyof MemberEditInput) =>
    errors[name] ? `${name}-error` : undefined

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="mt-5 max-w-2xl space-y-5 rounded-[10px] border border-border bg-card p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('memberNew.name')}</Label>
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
          <Label htmlFor="phone">{t('memberEdit.phoneLabel')}</Label>
          {/* Read-only, not disabled: it stays readable and selectable. */}
          <Input
            id="phone"
            value={phone}
            readOnly
            aria-describedby="phone-note"
            className="bg-secondary tabular-nums"
          />
          <p id="phone-note" className="text-[13px] text-muted-foreground">
            {t('memberEdit.phoneLocked')}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('memberNew.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            aria-invalid={invalid('email')}
            aria-describedby={describedBy('email')}
            {...register('email')}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bloodGroup">{t('memberNew.blood')}</Label>
          <NativeSelect id="bloodGroup" {...register('bloodGroup')}>
            <option value="">{t('memberNew.bloodUnknown')}</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {bloodLabel(group)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">{t('memberNew.address')}</Label>
        <Input
          id="address"
          autoComplete="off"
          aria-invalid={invalid('address')}
          aria-describedby={describedBy('address')}
          {...register('address')}
        />
        <FieldError id="address-error" message={errors.address?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="area">{t('memberNew.area')}</Label>
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
          <Label htmlFor="occupation">{t('memberNew.occupation')}</Label>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lastDonationDate">
            {t('memberEdit.lastDonation')}
          </Label>
          <Input
            id="lastDonationDate"
            type="date"
            aria-invalid={invalid('lastDonationDate')}
            aria-describedby={describedBy('lastDonationDate')}
            {...register('lastDonationDate')}
          />
          <FieldError
            id="lastDonationDate-error"
            message={errors.lastDonationDate?.message}
          />
        </div>
        <div className="flex items-end pb-1.5">
          <CheckboxField
            label={t('memberNew.willing')}
            {...register('willingToDonate')}
          />
        </div>
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
          {isSubmitting ? t('a.wait') : t('a.save')}
        </Button>
        <Link
          to="/admin/members"
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('a.cancel')}
        </Link>
      </div>
    </form>
  )
}
