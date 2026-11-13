import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { LangToggle } from '../components/lang-toggle.tsx'
import { PasswordInput } from '../components/password-input.tsx'
import { Button } from '../components/ui/button.tsx'
import { FieldError } from '../components/ui/field-error.tsx'
import { Label } from '../components/ui/label.tsx'
import { authClient } from '../lib/auth-client.ts'
import { getCurrentMemberFn } from '../lib/auth.functions.ts'
import { useT } from '../lib/i18n/index.tsx'
import { tFor } from '../lib/i18n/messages.ts'
import {
  MIN_PASSWORD_LENGTH,
  changePasswordSchema,
} from '../lib/password-rules.ts'
import { changePasswordFn } from '../lib/password.functions.ts'

export const Route = createFileRoute('/change-password')({
  head: ({ match }) => ({
    meta: [
      { title: tFor(match.context.lang)('auth.pageTitleChange') },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  beforeLoad: async () => {
    const member = await getCurrentMemberFn()
    if (!member) throw redirect({ to: '/login' })
    return { member }
  },
  component: ChangePasswordPage,
})

// The shared server rules plus a "type it twice" check that only the form needs.
const formSchema = changePasswordSchema
  .and(z.object({ confirm: z.string().min(1, 'val.confirmRequired') }))
  .refine((v) => v.newPassword === v.confirm, {
    message: 'val.passwordMismatch',
    path: ['confirm'],
  })
type Values = z.infer<typeof formSchema>

const serverMessageKeys = {
  WRONG_PASSWORD: 'auth.errorWrongCurrent',
  ACCOUNT_LOCKED: 'auth.errorLocked',
  UNAUTHENTICATED: 'auth.errorSession',
} as const

function ChangePasswordPage() {
  const t = useT()
  const { member } = Route.useRouteContext()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  })

  async function onSubmit(values: Values) {
    setFormError(null)
    try {
      const result = await changePasswordFn({
        data: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      })
      if (!result.ok) {
        setFormError(
          t(
            result.code in serverMessageKeys
              ? serverMessageKeys[result.code as keyof typeof serverMessageKeys]
              : 'auth.errorChangeFailed',
          ),
        )
        return
      }
      await navigate({ to: '/admin' })
    } catch {
      setFormError(t('auth.errorNetwork'))
    }
  }

  async function signOut() {
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">{t('site.name')}</p>
          <LangToggle />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold">{t('auth.changeTitle')}</h1>

          {member.mustChangePassword ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t('auth.tempNotice')}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {t('auth.changeLead')}
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">
                {member.mustChangePassword
                  ? t('auth.tempPassword')
                  : t('auth.currentPassword')}
              </Label>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                aria-invalid={errors.currentPassword ? true : undefined}
                aria-describedby={
                  errors.currentPassword ? 'currentPassword-error' : undefined
                }
                {...register('currentPassword')}
              />
              <FieldError
                id="currentPassword-error"
                message={errors.currentPassword?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                aria-invalid={errors.newPassword ? true : undefined}
                aria-describedby="newPassword-hint newPassword-error"
                {...register('newPassword')}
              />
              <p
                id="newPassword-hint"
                className="text-sm text-muted-foreground"
              >
                {t('auth.minHint', { min: MIN_PASSWORD_LENGTH })}
              </p>
              <FieldError
                id="newPassword-error"
                message={errors.newPassword?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">{t('auth.confirm')}</Label>
              <PasswordInput
                id="confirm"
                autoComplete="new-password"
                aria-invalid={errors.confirm ? true : undefined}
                aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                {...register('confirm')}
              />
              <FieldError
                id="confirm-error"
                message={errors.confirm?.message}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.wait') : t('auth.changeSubmit')}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={signOut}>
            {t('auth.signOut')}
          </Button>
        </div>
      </div>
    </main>
  )
}
