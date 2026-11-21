import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormRegisterReturn,
} from 'react-hook-form'

import {
  GENDERS,
  GENDER_LABEL_KEY,
  MARITAL_LABEL_KEY,
  MARITAL_STATUSES,
} from '../lib/member-profile.ts'
import type { ProfileKey, ProfileValues } from '../lib/member-profile.ts'
import { useT } from '../lib/i18n/index.tsx'
import type { MessageKey } from '../lib/i18n/messages.ts'
import { cn } from '../lib/utils.ts'
import { FieldError } from './ui/field-error.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { NativeSelect } from './ui/native-select.tsx'

// The personal-details and address fields, shared by the public application
// (/join) and the admin "new" and "edit" forms. Each form keeps its own name,
// phone, email and blood group; this renders the rest, so the three forms
// cannot drift apart. `variant` only changes sizes: the public site uses
// larger text for older readers, the admin panel is denser.

type Variant = 'public' | 'admin'

const styles = {
  public: {
    grid: 'grid gap-5 sm:grid-cols-2',
    label: 'text-[17px]',
    field: 'h-11 text-[17px]',
    error: 'text-base text-red-700',
  },
  admin: {
    grid: 'grid gap-4 md:grid-cols-2',
    label: '',
    field: '',
    error: '',
  },
} as const

type FieldSpec = {
  key: ProfileKey
  label: MessageKey
  // Browser autofill hint; only on the public form (admins type for others).
  autoComplete?: string
  type?: 'date'
  inputMode?: 'numeric'
  maxLength?: number
}

const PERSONAL_TEXT: FieldSpec[] = [
  { key: 'fatherName', label: 'profile.fatherName' },
  { key: 'motherName', label: 'profile.motherName' },
  {
    key: 'dateOfBirth',
    label: 'profile.dateOfBirth',
    type: 'date',
    autoComplete: 'bday',
  },
]
const WORK: FieldSpec[] = [
  {
    key: 'occupation',
    label: 'profile.occupation',
    autoComplete: 'organization-title',
  },
  {
    key: 'organization',
    label: 'profile.organization',
    autoComplete: 'organization',
  },
]
const ADDRESS: FieldSpec[] = [
  {
    key: 'houseVillage',
    label: 'profile.houseVillage',
    autoComplete: 'address-line1',
  },
  { key: 'roadWard', label: 'profile.roadWard', autoComplete: 'address-line2' },
  { key: 'postOffice', label: 'profile.postOffice' },
  {
    key: 'postCode',
    label: 'profile.postCode',
    autoComplete: 'postal-code',
    inputMode: 'numeric',
    maxLength: 4,
  },
  { key: 'upazila', label: 'profile.upazila', autoComplete: 'address-level2' },
  {
    key: 'district',
    label: 'profile.district',
    autoComplete: 'address-level1',
  },
]

type Props<T extends FieldValues & ProfileValues> = {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  variant: Variant
}

// Top-level components (not created inside another component), so React keeps
// the same input between renders and typing never loses focus.
function TextField({
  spec,
  variant,
  registration,
  error,
}: {
  spec: FieldSpec
  variant: Variant
  registration: UseFormRegisterReturn
  error: string | undefined
}) {
  const t = useT()
  const s = styles[variant]
  return (
    <div className="space-y-1.5">
      <Label htmlFor={spec.key} className={s.label}>
        {t(spec.label)}
      </Label>
      <Input
        id={spec.key}
        type={spec.type ?? 'text'}
        inputMode={spec.inputMode}
        maxLength={spec.maxLength}
        // Autofill helps people filling in their own details, not admins
        // typing someone else's.
        autoComplete={
          variant === 'public' ? (spec.autoComplete ?? 'off') : 'off'
        }
        className={s.field}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${spec.key}-error` : undefined}
        {...registration}
      />
      <FieldError
        {...(s.error ? { className: s.error } : {})}
        id={`${spec.key}-error`}
        message={error}
      />
    </div>
  )
}

function ChoiceField({
  fieldKey,
  label,
  options,
  variant,
  registration,
}: {
  fieldKey: 'gender' | 'maritalStatus'
  label: MessageKey
  options: { value: string; label: MessageKey }[]
  variant: Variant
  registration: UseFormRegisterReturn
}) {
  const t = useT()
  const s = styles[variant]
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldKey} className={s.label}>
        {t(label)}
      </Label>
      <NativeSelect id={fieldKey} className={s.field} {...registration}>
        <option value="">{t('profile.notGiven')}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
          </option>
        ))}
      </NativeSelect>
    </div>
  )
}

// The form's own type is wider than ProfileValues; these keys are in it.
function helpers<T extends FieldValues & ProfileValues>({
  register,
  errors,
}: Props<T>) {
  return {
    reg: (key: ProfileKey) => register(key as Path<T>),
    errorOf: (key: ProfileKey) =>
      (errors as FieldErrors<ProfileValues>)[key]?.message,
  }
}

/** Father's and mother's name, date of birth, gender, marital status, work. */
export function PersonalFields<T extends FieldValues & ProfileValues>(
  props: Props<T>,
) {
  const { reg, errorOf } = helpers(props)
  const { variant } = props
  const text = (spec: FieldSpec) => (
    <TextField
      key={spec.key}
      spec={spec}
      variant={variant}
      registration={reg(spec.key)}
      error={errorOf(spec.key)}
    />
  )
  return (
    <div className={styles[variant].grid}>
      {PERSONAL_TEXT.map(text)}
      <ChoiceField
        fieldKey="gender"
        label="profile.gender"
        options={GENDERS.map((g) => ({ value: g, label: GENDER_LABEL_KEY[g] }))}
        variant={variant}
        registration={reg('gender')}
      />
      <ChoiceField
        fieldKey="maritalStatus"
        label="profile.maritalStatus"
        options={MARITAL_STATUSES.map((m) => ({
          value: m,
          label: MARITAL_LABEL_KEY[m],
        }))}
        variant={variant}
        registration={reg('maritalStatus')}
      />
      {WORK.map(text)}
    </div>
  )
}

/** The address, in the order Bangladeshi addresses are written. */
export function AddressFields<T extends FieldValues & ProfileValues>(
  props: Props<T>,
) {
  const { reg, errorOf } = helpers(props)
  const { variant } = props
  return (
    <div className={styles[variant].grid}>
      {ADDRESS.map((spec) => (
        <TextField
          key={spec.key}
          spec={spec}
          variant={variant}
          registration={reg(spec.key)}
          error={errorOf(spec.key)}
        />
      ))}
    </div>
  )
}

/** A titled group of fields: a real <fieldset> with a <legend>. */
export function FormSection({
  title,
  note,
  variant,
  children,
}: {
  title: MessageKey
  note?: MessageKey
  variant: Variant
  children: React.ReactNode
}) {
  const t = useT()
  return (
    <fieldset className="min-w-0 space-y-4">
      <legend
        className={cn(
          'font-semibold',
          variant === 'public'
            ? 'mb-1 text-[20px] text-brand-deep'
            : 'mb-0.5 text-[15px]',
        )}
      >
        {t(title)}
      </legend>
      {note && (
        <p
          className={cn(
            'text-muted-foreground',
            variant === 'public' ? 'text-base' : 'text-[13px]',
          )}
        >
          {t(note)}
        </p>
      )}
      {children}
    </fieldset>
  )
}
