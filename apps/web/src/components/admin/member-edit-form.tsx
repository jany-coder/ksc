import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useT } from '../../lib/i18n/index.tsx'
import { BLOOD_GROUPS, bloodLabel } from '../../lib/member-options.ts'
import { memberEditSchema } from '../../lib/member-form.ts'
import type { MemberEditInput } from '../../lib/member-form.ts'
import { cn } from '../../lib/utils.ts'
import { Button, buttonVariants } from '../ui/button.tsx'
import { CheckboxField } from '../ui/checkbox-field.tsx'
import { FieldError } from '../ui/field-error.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'
import { NativeSelect } from '../ui/native-select.tsx'
import {
  AddressFields,
  FormSection,
  PersonalFields,
} from '../member-profile-fields.tsx'

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
      className="space-y-6 rounded-[10px] border border-border bg-card p-4 sm:p-5"
    >
      <FormSection title="profile.personal" variant="admin">
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
        <PersonalFields register={register} errors={errors} variant="admin" />
      </FormSection>

      <FormSection
        title="profile.contact"
        note="profile.allOptional"
        variant="admin"
      >
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
        <AddressFields register={register} errors={errors} variant="admin" />
      </FormSection>

      <FormSection title="drawer.sectionBlood" variant="admin">
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
      </FormSection>

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      {/* Stays at the bottom of the screen while the long form scrolls, so
          Save is always one tap away (on a phone especially). */}
      <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-2 rounded-b-[10px] border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 grow sm:h-9 sm:grow-0"
        >
          {isSubmitting ? t('a.wait') : t('a.save')}
        </Button>
        <Link
          to="/admin/members"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-11 grow sm:h-9 sm:grow-0',
          )}
        >
          {t('a.cancel')}
        </Link>
      </div>
    </form>
  )
}
